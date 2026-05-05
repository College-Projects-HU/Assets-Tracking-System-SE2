package com.assets.reportservice.service;

import com.assets.reportservice.client.AssetServiceClient;
import com.assets.reportservice.client.AssignmentServiceClient;
import com.assets.reportservice.client.MaintenanceServiceClient;
import com.assets.reportservice.dto.AuditLogDTO;
import com.assets.reportservice.entity.AuditLogEntry;
import com.assets.reportservice.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private AssetServiceClient assetClient;

    @Mock
    private AssignmentServiceClient assignmentClient;

    @Mock
    private MaintenanceServiceClient maintenanceClient;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void getDashboardStatsAggregatesAssetsAssignmentsAndCosts() {
        AssetServiceClient.AssetDTO laptopActive = new AssetServiceClient.AssetDTO();
        laptopActive.id = 1L;
        laptopActive.category = "Laptop";
        laptopActive.status = "ACTIVE";

        AssetServiceClient.AssetDTO laptopRetired = new AssetServiceClient.AssetDTO();
        laptopRetired.id = 2L;
        laptopRetired.category = "Laptop";
        laptopRetired.status = "RETIRED";

        AssetServiceClient.AssetDTO chairActive = new AssetServiceClient.AssetDTO();
        chairActive.id = 3L;
        chairActive.category = "Chair";
        chairActive.status = "ACTIVE";

        AssignmentServiceClient.AssignmentDTO assignment = new AssignmentServiceClient.AssignmentDTO();
        assignment.id = 10L;
        assignment.assetId = 1L;
        assignment.assigneeId = 55L;
        assignment.assigneeName = "Jane Doe";
        assignment.status = "ACTIVE";

        MaintenanceServiceClient.MaintenanceDTO repairOne = new MaintenanceServiceClient.MaintenanceDTO();
        repairOne.id = 100L;
        repairOne.assetId = 1L;
        repairOne.cost = 150.0;
        repairOne.category = "Laptop";

        MaintenanceServiceClient.MaintenanceDTO repairTwo = new MaintenanceServiceClient.MaintenanceDTO();
        repairTwo.id = 101L;
        repairTwo.assetId = 3L;
        repairTwo.cost = 50.0;
        repairTwo.category = "Chair";

        when(assetClient.getAllAssets()).thenReturn(Arrays.asList(laptopActive, laptopRetired, chairActive));
        when(assignmentClient.getActiveAssignments()).thenReturn(Collections.singletonList(assignment));
        when(maintenanceClient.getAllMaintenances()).thenReturn(Arrays.asList(repairOne, repairTwo));

        com.assets.reportservice.dto.DashboardStatsDTO stats = reportService.getDashboardStats();

        assertEquals(2, stats.assetSummary.size());
        assertEquals(1, stats.activeAssignments.size());
        assertEquals(200.0, stats.maintenanceCosts.totalCost, 0.001);
        assertEquals(150.0, stats.maintenanceCosts.byCategory.get("Laptop"), 0.001);
        assertEquals(50.0, stats.maintenanceCosts.byCategory.get("Chair"), 0.001);
    }

    @Test
    void getFullInventoryFiltersByCategoryAndStatus() {
        AssetServiceClient.AssetDTO laptopActive = new AssetServiceClient.AssetDTO();
        laptopActive.id = 1L;
        laptopActive.category = "Laptop";
        laptopActive.status = "ACTIVE";

        AssetServiceClient.AssetDTO laptopRetired = new AssetServiceClient.AssetDTO();
        laptopRetired.id = 2L;
        laptopRetired.category = "Laptop";
        laptopRetired.status = "RETIRED";

        AssetServiceClient.AssetDTO chairActive = new AssetServiceClient.AssetDTO();
        chairActive.id = 3L;
        chairActive.category = "Chair";
        chairActive.status = "ACTIVE";

        when(assetClient.getAllAssets()).thenReturn(Arrays.asList(laptopActive, laptopRetired, chairActive));

        List<com.assets.reportservice.dto.InventoryItemDTO> filtered = reportService.getFullInventory(null, null, "Laptop", "ACTIVE");

        assertEquals(1, filtered.size());
        assertEquals(Long.valueOf(1L), filtered.get(0).id);
    }

    @Test
    void getAuditLogsMapsAndPagesResults() {
        AuditLogEntry entry = new AuditLogEntry();
        entry.setActor("admin@example.com");
        entry.setAction("CREATE_ASSET");
        entry.setDetails("Created asset 42");
        entry.setResourceType("ASSET");
        entry.setResourceId("42");
        entry.setCreatedAt(LocalDateTime.of(2026, 5, 1, 10, 15));

        Page<AuditLogEntry> page = new PageImpl<>(Collections.singletonList(entry), PageRequest.of(0, 20), 1);
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<AuditLogDTO> result = reportService.getAuditLogs(null, null, "admin", 0, 20);

        assertEquals(1, result.getTotalElements());
        assertEquals("admin@example.com", result.getContent().get(0).actor);
        assertTrue(result.getContent().get(0).createdAt.isBefore(LocalDateTime.now().plusSeconds(1)));
        assertFalse(result.getContent().isEmpty());
    }
}
