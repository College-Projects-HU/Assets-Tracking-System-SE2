package com.assets.reportservice.service;

import com.assets.reportservice.client.AssetServiceClient;
import com.assets.reportservice.client.AssignmentServiceClient;
import com.assets.reportservice.client.MaintenanceServiceClient;
import com.assets.reportservice.dto.*;
import com.assets.reportservice.entity.AuditLogEntry;
import com.assets.reportservice.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import jakarta.persistence.criteria.Predicate;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AssetServiceClient assetClient;
    private final AssignmentServiceClient assignmentClient;
    private final MaintenanceServiceClient maintenanceClient;
    private final AuditLogRepository auditLogRepository;

    public ReportService(AssetServiceClient assetClient,
                         AssignmentServiceClient assignmentClient,
                         MaintenanceServiceClient maintenanceClient,
                         AuditLogRepository auditLogRepository) {
        this.assetClient = assetClient;
        this.assignmentClient = assignmentClient;
        this.maintenanceClient = maintenanceClient;
        this.auditLogRepository = auditLogRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        List<AssetServiceClient.AssetDTO> assets = safeCallAssets();
        List<AssignmentServiceClient.AssignmentDTO> assignments = safeCallAssignments();
        List<MaintenanceServiceClient.MaintenanceDTO> maint = safeCallMaintenances();

        // Asset summary: group by category -> status counts
        Map<String, Map<String, Integer>> grouped = new HashMap<>();
        for (AssetServiceClient.AssetDTO a : assets) {
            String cat = a.category == null ? "UNKNOWN" : a.category;
            String status = a.status == null ? "UNKNOWN" : a.status;
            grouped.computeIfAbsent(cat, k -> new HashMap<>());
            Map<String, Integer> m = grouped.get(cat);
            m.put(status, m.getOrDefault(status, 0) + 1);
        }

        List<AssetCategoryStatusCount> assetSummary = grouped.entrySet().stream()
                .map(e -> new AssetCategoryStatusCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Active assignments: map to DTO
        List<AssignmentDTO> activeAssignments = assignments.stream()
                .map(a -> new AssignmentDTO(a.id, a.assetId, a.assigneeId, a.assigneeName, a.status))
                .collect(Collectors.toList());

        // Maintenance costs
        double total = 0.0;
        Map<String, Double> byCategory = new HashMap<>();
        for (MaintenanceServiceClient.MaintenanceDTO m : maint) {
            total += m.cost;
            String cat = m.category == null ? "UNKNOWN" : m.category;
            byCategory.put(cat, byCategory.getOrDefault(cat, 0.0) + m.cost);
        }
        MaintenanceCostDTO maintenanceCostDTO = new MaintenanceCostDTO(total, byCategory);

        return new DashboardStatsDTO(assetSummary, activeAssignments, maintenanceCostDTO);
    }

    public List<InventoryItemDTO> getFullInventory(String startDate, String endDate, String category, String status) {
        List<AssetServiceClient.AssetDTO> assets = safeCallAssets();
        return assets.stream()
                .filter(a -> (category == null || category.isEmpty() || category.equalsIgnoreCase(a.category)))
                .filter(a -> (status == null || status.isEmpty() || status.equalsIgnoreCase(a.status)))
                .map(a -> new InventoryItemDTO(a.id, a.category, a.status, a.assignedUserId, a.assignedUserName, a.location, a.warrantyExpiry))
                .collect(Collectors.toList());
    }

    public List<MaintenanceServiceClient.MaintenanceDTO> getMaintenanceSummary(String startDate, String endDate) {
        List<MaintenanceServiceClient.MaintenanceDTO> maint = safeCallMaintenances();
        // Currently maintenance DTO lacks dates; return all for now. Filtering by date can be added when service provides dates.
        return maint;
    }

    public List<InventoryItemDTO> getWarrantyExpiry(int days) {
        List<AssetServiceClient.AssetDTO> assets = safeCallAssets();
        if (assets == null) return Collections.emptyList();
        // If warrantyExpiry is present as ISO date, we'd parse and compare; currently just return assets that have a non-null warrantyExpiry field.
        return assets.stream()
                .filter(a -> a.warrantyExpiry != null && !a.warrantyExpiry.isEmpty())
                .map(a -> new InventoryItemDTO(a.id, a.category, a.status, a.assignedUserId, a.assignedUserName, a.location, a.warrantyExpiry))
                .collect(Collectors.toList());
    }

    public ResponseEntity<StreamingResponseBody> streamFullInventoryCsv(String startDate, String endDate, String category, String status) {
        List<InventoryItemDTO> rows = getFullInventory(startDate, endDate, category, status);
        StreamingResponseBody body = outputStream -> writeInventoryCsv(outputStream, rows);
        return csvResponse("full-inventory.csv", body);
    }

    public ResponseEntity<StreamingResponseBody> streamMaintenanceSummaryCsv(String startDate, String endDate) {
        List<MaintenanceServiceClient.MaintenanceDTO> rows = getMaintenanceSummary(startDate, endDate);
        StreamingResponseBody body = outputStream -> writeMaintenanceCsv(outputStream, rows);
        return csvResponse("maintenance-summary.csv", body);
    }

    public ResponseEntity<StreamingResponseBody> streamWarrantyExpiryCsv(int days) {
        List<InventoryItemDTO> rows = getWarrantyExpiry(days);
        StreamingResponseBody body = outputStream -> writeInventoryCsv(outputStream, rows);
        return csvResponse("warranty-expiry.csv", body);
    }

    public Page<AuditLogDTO> getAuditLogs(String startDate, String endDate, String actor, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime start = parseDateTimeOrNull(startDate, true);
        LocalDateTime end = parseDateTimeOrNull(endDate, false);

        Specification<AuditLogEntry> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (actor != null && !actor.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("actor")), "%" + actor.toLowerCase(Locale.ROOT) + "%"));
            }
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLogEntry> entries = auditLogRepository.findAll(spec, pageable);
        List<AuditLogDTO> content = entries.getContent().stream()
                .map(this::toAuditLogDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, entries.getTotalElements());
    }

    private ResponseEntity<StreamingResponseBody> csvResponse(String filename, StreamingResponseBody body) {
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(body);
    }

    private AuditLogDTO toAuditLogDTO(AuditLogEntry entry) {
        return new AuditLogDTO(
                entry.getId(),
                entry.getActor(),
                entry.getAction(),
                entry.getDetails(),
                entry.getResourceType(),
                entry.getResourceId(),
                entry.getCreatedAt()
        );
    }

    private LocalDateTime parseDateTimeOrNull(String value, boolean startOfDay) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ex) {
            try {
                return java.time.LocalDate.parse(value).atTime(startOfDay ? 0 : 23, startOfDay ? 0 : 59, startOfDay ? 0 : 59);
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }

    private void writeInventoryCsv(java.io.OutputStream outputStream, List<InventoryItemDTO> rows) throws java.io.IOException {
        try (Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
            writer.write("id,category,status,assignedUserId,assignedUserName,location,warrantyExpiry\n");
            for (InventoryItemDTO row : rows) {
                writer.write(csv(row.id));
                writer.write(',');
                writer.write(csv(row.category));
                writer.write(',');
                writer.write(csv(row.status));
                writer.write(',');
                writer.write(csv(row.assignedUserId));
                writer.write(',');
                writer.write(csv(row.assignedUserName));
                writer.write(',');
                writer.write(csv(row.location));
                writer.write(',');
                writer.write(csv(row.warrantyExpiry));
                writer.write('\n');
            }
            writer.flush();
        }
    }

    private void writeMaintenanceCsv(java.io.OutputStream outputStream, List<MaintenanceServiceClient.MaintenanceDTO> rows) throws java.io.IOException {
        try (Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
            writer.write("id,assetId,cost,category\n");
            for (MaintenanceServiceClient.MaintenanceDTO row : rows) {
                writer.write(csv(row.id));
                writer.write(',');
                writer.write(csv(row.assetId));
                writer.write(',');
                writer.write(csv(row.cost));
                writer.write(',');
                writer.write(csv(row.category));
                writer.write('\n');
            }
            writer.flush();
        }
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        boolean needsQuotes = text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r");
        text = text.replace("\"", "\"\"");
        return needsQuotes ? "\"" + text + "\"" : text;
    }

    public ResponseEntity<StreamingResponseBody> streamAuditLogCsv(String startDate, String endDate, String actor, int page, int size) {
        Page<AuditLogDTO> logs = getAuditLogs(startDate, endDate, actor, page, size);
        StreamingResponseBody body = outputStream -> {
            try (Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
                writer.write("id,actor,action,details,resourceType,resourceId,createdAt\n");
                for (AuditLogDTO row : logs.getContent()) {
                    writer.write(csv(row.id));
                    writer.write(',');
                    writer.write(csv(row.actor));
                    writer.write(',');
                    writer.write(csv(row.action));
                    writer.write(',');
                    writer.write(csv(row.details));
                    writer.write(',');
                    writer.write(csv(row.resourceType));
                    writer.write(',');
                    writer.write(csv(row.resourceId));
                    writer.write(',');
                    writer.write(csv(row.createdAt));
                    writer.write('\n');
                }
                writer.flush();
            }
        };
        return csvResponse("audit-log.csv", body);
    }

    private List<AssetServiceClient.AssetDTO> safeCallAssets() {
        try { return assetClient.getAllAssets(); } catch (Exception e) { return Collections.emptyList(); }
    }

    private List<AssignmentServiceClient.AssignmentDTO> safeCallAssignments() {
        try { return assignmentClient.getActiveAssignments(); } catch (Exception e) { return Collections.emptyList(); }
    }

    private List<MaintenanceServiceClient.MaintenanceDTO> safeCallMaintenances() {
        try { return maintenanceClient.getAllMaintenances(); } catch (Exception e) { return Collections.emptyList(); }
    }
}
