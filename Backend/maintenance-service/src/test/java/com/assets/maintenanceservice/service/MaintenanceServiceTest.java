package com.assets.maintenanceservice.service;

import com.assets.maintenanceservice.client.AssetServiceClient;
import com.assets.maintenanceservice.dto.MaintenanceNotesDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketRequestDTO;
import com.assets.maintenanceservice.entity.MaintenanceStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import com.assets.maintenanceservice.entity.Priority;
import com.assets.maintenanceservice.exception.ConflictException;
import com.assets.maintenanceservice.exception.ForbiddenException;
import com.assets.maintenanceservice.exception.ResourceNotFoundException;
import com.assets.maintenanceservice.repository.MaintenanceTicketRepository;
import com.assets.maintenanceservice.service.impl.MaintenanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceTicketRepository ticketRepository;

    @Mock
    private AssetServiceClient assetServiceClient;

    @InjectMocks
    private MaintenanceServiceImpl maintenanceService;

    private MaintenanceTicket ticket;
    private AssetServiceClient.AssetDTO assetDTO;

    @BeforeEach
    void setUp() {
        ticket = MaintenanceTicket.builder()
                .id(1L)
                .ticketId("MNT-123")
                .assetId(10L)
                .reportedByUserId(5L)
                .status(MaintenanceStatus.OPEN)
                .priority(Priority.HIGH)
                .build();

        assetDTO = new AssetServiceClient.AssetDTO();
        assetDTO.id = 10L;
        assetDTO.assignedUserId = 5L;
        assetDTO.status = "AVAILABLE";
    }

    @Test
    void createTicket_Success() {
        MaintenanceTicketRequestDTO req = new MaintenanceTicketRequestDTO();
        req.setAssetId(10L);
        req.setPriority(Priority.HIGH);
        req.setDescription("Broken screen");

        when(assetServiceClient.getAssetById(10L)).thenReturn(assetDTO);
        when(ticketRepository.save(any(MaintenanceTicket.class))).thenReturn(ticket);

        MaintenanceTicketDTO result = maintenanceService.createTicket(req, 5L, "ROLE_EMPLOYEE");

        assertNotNull(result);
        assertEquals(MaintenanceStatus.OPEN, result.getStatus());
        verify(assetServiceClient).updateAssetStatus(10L, "UNDER_MAINTENANCE");
    }

    @Test
    void createTicket_Forbidden() {
        MaintenanceTicketRequestDTO req = new MaintenanceTicketRequestDTO();
        req.setAssetId(10L);

        assetDTO.assignedUserId = 99L; // Assigned to someone else
        when(assetServiceClient.getAssetById(10L)).thenReturn(assetDTO);

        assertThrows(ForbiddenException.class, () -> maintenanceService.createTicket(req, 5L, "ROLE_EMPLOYEE"));
    }

    @Test
    void updateTicketStatus_ValidTransition() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(ticket);

        MaintenanceTicketDTO result = maintenanceService.updateTicketStatus(1L, "IN_PROGRESS");
        assertEquals(MaintenanceStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void updateTicketStatus_InvalidTransition() {
        ticket.setStatus(MaintenanceStatus.OPEN);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThrows(ConflictException.class, () -> maintenanceService.updateTicketStatus(1L, "RESOLVED"));
    }

    @Test
    void updateTicketStatus_ToResolved_UpdatesAssetStatus() {
        ticket.setStatus(MaintenanceStatus.IN_PROGRESS);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(ticket);

        maintenanceService.updateTicketStatus(1L, "RESOLVED");

        verify(assetServiceClient).updateAssetStatus(10L, "AVAILABLE");
        assertEquals(MaintenanceStatus.RESOLVED, ticket.getStatus());
        assertNotNull(ticket.getResolvedAt());
    }

    @Test
    void addNotes_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(ticket);

        MaintenanceNotesDTO notes = new MaintenanceNotesDTO("Fixed");
        MaintenanceTicketDTO result = maintenanceService.addNotes(1L, notes);

        assertNotNull(result);
        assertTrue(ticket.getNotes().contains("Fixed"));
    }
}
