package com.assets.maintenanceservice.service;

import com.assets.maintenanceservice.client.AssetServiceClient;
import com.assets.maintenanceservice.domain.TicketPriority;
import com.assets.maintenanceservice.domain.TicketStatus;
import com.assets.maintenanceservice.dto.CreateMaintenanceTicketRequest;
import com.assets.maintenanceservice.dto.MaintenanceStatusUpdateRequest;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import com.assets.maintenanceservice.repository.MaintenanceTicketRepository;
import com.assets.maintenanceservice.repository.TicketNoteRepository;
import com.assets.maintenanceservice.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {
    @Mock
    private MaintenanceTicketRepository ticketRepository;
    @Mock
    private TicketNoteRepository noteRepository;
    @Mock
    private AssetServiceClient assetServiceClient;

    @InjectMocks
    private MaintenanceService maintenanceService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createSetsOpenStatusAndPushesAssetToMaintenance() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(7L, "emp@example.com", "ROLE_EMPLOYEE"), null, List.of())
        );

        CreateMaintenanceTicketRequest request = new CreateMaintenanceTicketRequest();
        request.setAssetId(100L);
        request.setIssueDescription("Battery failure");
        request.setPriority(TicketPriority.HIGH);

        when(ticketRepository.count()).thenReturn(0L);
        when(ticketRepository.save(any(MaintenanceTicket.class))).thenAnswer(invocation -> {
            MaintenanceTicket ticket = invocation.getArgument(0);
            ticket.setId(1L);
            return ticket;
        });
        when(noteRepository.findByTicketIdOrderByCreatedAtAsc(1L)).thenReturn(List.of());

        var response = maintenanceService.create(request);

        assertEquals(TicketStatus.OPEN, response.getStatus());
        assertEquals(7L, response.getReportedByUserId());
        verify(assetServiceClient).updateAssetStatus(any(), any());
    }

    @Test
    void resolvingTicketMarksAssetAvailable() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(1L, "manager@example.com", "ROLE_ASSET_MANAGER"), null, List.of())
        );

        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .id(5L)
                .ticketCode("MT-2026-0005")
                .assetId(42L)
                .reportedByUserId(7L)
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.IN_PROGRESS)
                .issueDescription("Screen issue")
                .build();

        when(ticketRepository.findById(5L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(MaintenanceTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(noteRepository.findByTicketIdOrderByCreatedAtAsc(5L)).thenReturn(List.of());

        MaintenanceStatusUpdateRequest request = new MaintenanceStatusUpdateRequest();
        request.setStatus(TicketStatus.RESOLVED);
        request.setResolutionDetails("Replaced cable");

        var response = maintenanceService.updateStatus(5L, request);

        assertEquals(TicketStatus.RESOLVED, response.getStatus());
        ArgumentCaptor<AssetServiceClient.AssetStatusUpdateRequest> captor = ArgumentCaptor.forClass(AssetServiceClient.AssetStatusUpdateRequest.class);
        verify(assetServiceClient).updateAssetStatus(any(), captor.capture());
        assertEquals("AVAILABLE", captor.getValue().status());
    }
}
