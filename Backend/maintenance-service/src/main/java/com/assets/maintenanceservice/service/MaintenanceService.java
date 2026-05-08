package com.assets.maintenanceservice.service;

import com.assets.maintenanceservice.client.AssetServiceClient;
import com.assets.maintenanceservice.domain.TicketStatus;
import com.assets.maintenanceservice.dto.*;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import com.assets.maintenanceservice.entity.TicketNote;
import com.assets.maintenanceservice.exception.ConflictException;
import com.assets.maintenanceservice.exception.IllegalStateTransitionException;
import com.assets.maintenanceservice.exception.NotFoundException;
import com.assets.maintenanceservice.repository.MaintenanceTicketRepository;
import com.assets.maintenanceservice.repository.TicketNoteRepository;
import com.assets.maintenanceservice.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {
    private final MaintenanceTicketRepository ticketRepository;
    private final TicketNoteRepository noteRepository;
    private final AssetServiceClient assetServiceClient;

    @Transactional
    public MaintenanceTicketResponse create(CreateMaintenanceTicketRequest request) {
        Long userId = CurrentUser.id();
        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .ticketCode(nextTicketCode())
                .assetId(request.getAssetId())
                .reportedByUserId(userId)
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .issueDescription(request.getIssueDescription())
                .scheduledAt(request.getScheduledAt())
                .build();
        ticket = ticketRepository.save(ticket);
        updateAssetStatus(ticket.getAssetId(), "MAINTENANCE", "Maintenance ticket " + ticket.getTicketCode() + " opened");
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceTicketResponse> listAll() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceTicketResponse> myTickets() {
        Long userId = CurrentUser.id();
        return ticketRepository.findByReportedByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MaintenanceTicketResponse get(Long id) {
        MaintenanceTicket ticket = find(id);
        enforceReadable(ticket);
        return toResponse(ticket);
    }

    @Transactional
    public MaintenanceTicketResponse updateStatus(Long id, MaintenanceStatusUpdateRequest request) {
        MaintenanceTicket ticket = find(id);
        TicketStatus current = ticket.getStatus();
        TicketStatus target = request.getStatus();
        if (current == target) {
            return toResponse(ticket);
        }
        if (!current.canTransitionTo(target)) {
            throw new IllegalStateTransitionException("Illegal ticket status transition: " + current + " -> " + target);
        }
        ticket.setStatus(target);
        if (request.getTechnicianUserId() != null) {
            ticket.setTechnicianUserId(request.getTechnicianUserId());
        }
        if (request.getResolutionDetails() != null) {
            ticket.setResolutionDetails(request.getResolutionDetails());
        }
        if (request.getMaintenanceCost() != null) {
            ticket.setMaintenanceCost(request.getMaintenanceCost());
        }
        if (target == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            updateAssetStatus(ticket.getAssetId(), "AVAILABLE", "Maintenance ticket " + ticket.getTicketCode() + " resolved");
        }
        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional
    public TicketNoteResponse addNote(Long ticketId, TicketNoteRequest request) {
        MaintenanceTicket ticket = find(ticketId);
        enforceReadable(ticket);
        TicketNote note = TicketNote.builder()
                .ticketId(ticket.getId())
                .authorUserId(CurrentUser.id())
                .note(request.getNote())
                .build();
        return TicketNoteResponse.from(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceTicketResponse> upcoming() {
        return ticketRepository.findByScheduledAtIsNotNullOrderByScheduledAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InternalMaintenanceDto> internalMaintenances() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ticket -> new InternalMaintenanceDto(
                        ticket.getId(),
                        ticket.getAssetId(),
                        ticket.getMaintenanceCost() == null ? 0.0 : ticket.getMaintenanceCost().doubleValue(),
                        "MAINTENANCE"
                ))
                .toList();
    }

    private MaintenanceTicket find(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Maintenance ticket not found: " + id));
    }

    private void enforceReadable(MaintenanceTicket ticket) {
        String role = CurrentUser.role();
        if ("ROLE_ADMIN".equals(role) || "ROLE_ASSET_MANAGER".equals(role)) {
            return;
        }
        if (!ticket.getReportedByUserId().equals(CurrentUser.id())) {
            throw new ConflictException("You can only access your own maintenance tickets");
        }
    }

    private MaintenanceTicketResponse toResponse(MaintenanceTicket ticket) {
        List<TicketNoteResponse> notes = noteRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .map(TicketNoteResponse::from)
                .toList();
        return MaintenanceTicketResponse.from(ticket, notes);
    }

    private void updateAssetStatus(Long assetId, String status, String reason) {
        try {
            assetServiceClient.updateAssetStatus(assetId, new AssetServiceClient.AssetStatusUpdateRequest(status, reason));
        } catch (Exception ignored) {
            // Keep the ticket flow usable even if the asset service is unavailable.
        }
    }

    private String nextTicketCode() {
        long sequence = ticketRepository.count() + 1;
        return "MT-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy")) + "-" + String.format("%04d", sequence);
    }
}
