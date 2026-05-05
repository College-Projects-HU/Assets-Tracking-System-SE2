package com.assets.reportservice.controller;

import com.assets.reportservice.dto.DashboardStatsDTO;
import com.assets.reportservice.dto.AuditLogDTO;
import com.assets.reportservice.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO dto = reportService.getDashboardStats();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/full-inventory")
    public ResponseEntity<List<?>> getFullInventory(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "status", required = false) String status) {
        List<?> items = reportService.getFullInventory(startDate, endDate, category, status);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/maintenance-summary")
    public ResponseEntity<List<?>> getMaintenanceSummary(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate) {
        List<?> items = reportService.getMaintenanceSummary(startDate, endDate);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/warranty-expiry")
    public ResponseEntity<List<?>> getWarrantyExpiry(@RequestParam(name = "days", required = false) Integer days) {
        List<?> items = reportService.getWarrantyExpiry(days == null ? 30 : days);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/full-inventory/export")
    public ResponseEntity<StreamingResponseBody> exportFullInventory(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "status", required = false) String status) {
        return reportService.streamFullInventoryCsv(startDate, endDate, category, status);
    }

    @GetMapping("/maintenance-summary/export")
    public ResponseEntity<StreamingResponseBody> exportMaintenanceSummary(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate) {
        return reportService.streamMaintenanceSummaryCsv(startDate, endDate);
    }

    @GetMapping("/warranty-expiry/export")
    public ResponseEntity<StreamingResponseBody> exportWarrantyExpiry(@RequestParam(name = "days", required = false) Integer days) {
        return reportService.streamWarrantyExpiryCsv(days == null ? 30 : days);
    }

    @GetMapping("/audit-log")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLogDTO>> getAuditLog(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "actor", required = false) String actor,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(reportService.getAuditLogs(startDate, endDate, actor, page, size));
    }

    @GetMapping("/audit-log/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StreamingResponseBody> exportAuditLog(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "actor", required = false) String actor,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "1000") int size) {
        return reportService.streamAuditLogCsv(startDate, endDate, actor, page, size);
    }
}
