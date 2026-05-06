package com.assets.maintenanceservice.controller;

import com.assets.maintenanceservice.dto.MaintenanceNotesDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketRequestDTO;
import com.assets.maintenanceservice.entity.MaintenanceStatus;
import com.assets.maintenanceservice.entity.Priority;
import com.assets.maintenanceservice.service.MaintenanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MaintenanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MaintenanceService maintenanceService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void createTicket_Success() throws Exception {
        MaintenanceTicketRequestDTO request = new MaintenanceTicketRequestDTO();
        request.setAssetId(10L);
        request.setPriority(Priority.HIGH);
        request.setDescription("Screen broken");

        MaintenanceTicketDTO response = new MaintenanceTicketDTO();
        response.setId(1L);
        response.setTicketId("MNT-123");
        response.setStatus(MaintenanceStatus.OPEN);

        when(maintenanceService.createTicket(any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/maintenance")
                .header("X-User-Id", 5)
                .header("X-User-Role", "ROLE_EMPLOYEE")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketId").value("MNT-123"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @WithMockUser(roles = "ASSET_MANAGER")
    void updateTicketStatus_Success() throws Exception {
        MaintenanceTicketDTO response = new MaintenanceTicketDTO();
        response.setId(1L);
        response.setStatus(MaintenanceStatus.IN_PROGRESS);

        when(maintenanceService.updateTicketStatus(eq(1L), eq("IN_PROGRESS"))).thenReturn(response);

        mockMvc.perform(put("/api/maintenance/1/status")
                .param("status", "IN_PROGRESS")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void updateTicketStatus_ForbiddenForEmployee() throws Exception {
        mockMvc.perform(put("/api/maintenance/1/status")
                .param("status", "IN_PROGRESS")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void addNotes_Success() throws Exception {
        MaintenanceNotesDTO notes = new MaintenanceNotesDTO("Working on it");
        MaintenanceTicketDTO response = new MaintenanceTicketDTO();
        response.setNotes("Working on it");

        when(maintenanceService.addNotes(eq(1L), any())).thenReturn(response);

        mockMvc.perform(post("/api/maintenance/1/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notes))
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Working on it"));
    }

    @Test
    @WithMockUser(roles = "ASSET_MANAGER")
    void getAllTickets_Success() throws Exception {
        MaintenanceTicketDTO t1 = new MaintenanceTicketDTO();
        t1.setId(1L);
        
        when(maintenanceService.getAllTickets(any())).thenReturn(new PageImpl<>(List.of(t1)));

        mockMvc.perform(get("/api/maintenance?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }
}
