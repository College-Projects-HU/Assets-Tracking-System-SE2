package com.assets.reportservice.integration;

import com.assets.reportservice.client.AssetServiceClient;
import com.assets.reportservice.client.AssignmentServiceClient;
import com.assets.reportservice.client.MaintenanceServiceClient;
import com.assets.reportservice.entity.AuditLogEntry;
import com.assets.reportservice.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false"
})
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(roles = "ADMIN")
class ReportApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssetServiceClient assetClient;

    @MockBean
    private AssignmentServiceClient assignmentClient;

    @MockBean
    private MaintenanceServiceClient maintenanceClient;

    @MockBean
    private AuditLogRepository auditLogRepository;

    @Test
    void dashboardStatsAndExportsAndAuditLogWorkThroughMvc() throws Exception {
        AssetServiceClient.AssetDTO asset = new AssetServiceClient.AssetDTO();
        asset.id = 1L;
        asset.category = "Laptop";
        asset.status = "ACTIVE";
        asset.assignedUserId = 7L;
        asset.assignedUserName = "Jane Doe";
        asset.location = "HQ";
        asset.warrantyExpiry = "2026-12-31";

        AssignmentServiceClient.AssignmentDTO assignment = new AssignmentServiceClient.AssignmentDTO();
        assignment.id = 11L;
        assignment.assetId = 1L;
        assignment.assigneeId = 7L;
        assignment.assigneeName = "Jane Doe";
        assignment.status = "ACTIVE";

        MaintenanceServiceClient.MaintenanceDTO maintenance = new MaintenanceServiceClient.MaintenanceDTO();
        maintenance.id = 21L;
        maintenance.assetId = 1L;
        maintenance.cost = 100.0;
        maintenance.category = "Laptop";

        when(assetClient.getAllAssets()).thenReturn(Collections.singletonList(asset));
        when(assignmentClient.getActiveAssignments()).thenReturn(Collections.singletonList(assignment));
        when(maintenanceClient.getAllMaintenances()).thenReturn(Collections.singletonList(maintenance));

        AuditLogEntry entry = new AuditLogEntry();
        entry.setActor("admin@example.com");
        entry.setAction("EXPORT_REPORT");
        entry.setDetails("Exported report");
        entry.setResourceType("REPORT");
        entry.setResourceId("r1");
        entry.setCreatedAt(LocalDateTime.of(2026, 5, 1, 9, 30));

        Page<AuditLogEntry> page = new PageImpl<>(Collections.singletonList(entry), PageRequest.of(0, 20), 1);
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/reports/dashboard-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetSummary[0].category").value("Laptop"))
                .andExpect(jsonPath("$.activeAssignments[0].assigneeName").value("Jane Doe"))
                .andExpect(jsonPath("$.maintenanceCosts.totalCost").value(100.0));

        mockMvc.perform(get("/api/reports/full-inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].location").value("HQ"));

        mockMvc.perform(get("/api/reports/full-inventory/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"full-inventory.csv\""))
                .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("text/csv;charset=UTF-8")));

        mockMvc.perform(get("/api/reports/audit-log")
                        .param("actor", "admin")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].actor").value("admin@example.com"));
    }
}
