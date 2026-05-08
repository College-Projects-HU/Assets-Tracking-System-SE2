package com.assets.maintenanceservice.integration;

import com.assets.maintenanceservice.client.AssetServiceClient;
import com.assets.maintenanceservice.domain.TicketPriority;
import com.assets.maintenanceservice.domain.TicketStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import com.assets.maintenanceservice.repository.MaintenanceTicketRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class MaintenanceControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MaintenanceTicketRepository ticketRepository;

    @MockBean
    private AssetServiceClient assetServiceClient;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCanCreateTicket() throws Exception {
        doNothing().when(assetServiceClient).updateAssetStatus(anyLong(), any());

        mockMvc.perform(post("/api/maintenance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "assetId", 15,
                                "issueDescription", "Keyboard failure",
                                "priority", "HIGH"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @WithMockUser(roles = "ASSET_MANAGER")
    void managerCanAdvanceTicketStatus() throws Exception {
        doNothing().when(assetServiceClient).updateAssetStatus(anyLong(), any());

        MaintenanceTicket ticket = ticketRepository.save(MaintenanceTicket.builder()
                .ticketCode("MT-2026-0099")
                .assetId(15L)
                .reportedByUserId(7L)
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .issueDescription("Fan noise")
                .build());

        mockMvc.perform(put("/api/maintenance/{id}/status", ticket.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "IN_PROGRESS"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void internalReportingEndpointIsOpen() throws Exception {
        mockMvc.perform(get("/api/internal/maintenances"))
                .andExpect(status().isOk());
    }
}
