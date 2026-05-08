package com.assets.maintenanceservice.service.impl;

import com.assets.maintenanceservice.client.AssetServiceClient;
import com.assets.maintenanceservice.dto.MaintenanceNotesDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketRequestDTO;
import com.assets.maintenanceservice.entity.MaintenanceStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import com.assets.maintenanceservice.exception.ConflictException;
import com.assets.maintenanceservice.exception.ForbiddenException;
import com.assets.maintenanceservice.exception.ResourceNotFoundException;
import com.assets.maintenanceservice.repository.MaintenanceTicketRepository;
import com.assets.maintenanceservice.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceTicketRepository ticketRepository;
    private final AssetServiceClient assetServiceClient;

    @Override
    @Transactional
    public MaintenanceTicketDTO createTicket(MaintenanceTicketRequestDTO requestDTO, Long userId, String userRole) {
        // Validate asset via Feign
        AssetServiceClient.AssetDTO asset;
        try {
            asset = assetServiceClient.getAssetById(requestDTO.getAssetId());
        } catch (Exception e) {
            throw new ResourceNotFoundException("Asset not found or Asset Service is down");
        }

        // Validate asset belongs to requesting user or user is ADMIN/ASSET_MANAGER
        boolean isManager = userRole != null && (userRole.contains("ADMIN") || userRole.contains("ASSET_MANAGER"));
        if (!isManager) {
            if (asset.assignedUserId == null || !asset.assignedUserId.equals(userId)) {
                throw new ForbiddenException("You can only create maintenance tickets for assets assigned to you");
            }
        }

        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .assetId(requestDTO.getAssetId())
                .reportedByUserId(userId)
                .status(MaintenanceStatus.OPEN)
                .priority(requestDTO.getPriority())
                .description(requestDTO.getDescription())
                .scheduledDate(requestDTO.getScheduledDate())
                .build();

        MaintenanceTicket savedTicket = ticketRepository.save(ticket);

        // Update asset status
        try {
            assetServiceClient.updateAssetStatus(requestDTO.getAssetId(), "UNDER_MAINTENANCE");
        } catch (Exception e) {
            throw new ConflictException("Failed to update asset status in Asset Service");
        }

        return mapToDTO(savedTicket);
    }

    @Override
    @Transactional
    public MaintenanceTicketDTO updateTicketStatus(Long id, String statusStr) {
        MaintenanceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance ticket not found with id: " + id));

        MaintenanceStatus newStatus;
        try {
            newStatus = MaintenanceStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ConflictException("Invalid status: " + statusStr);
        }

        validateStatusTransition(ticket.getStatus(), newStatus);
        ticket.setStatus(newStatus);

        if (newStatus == MaintenanceStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            // Update asset status back to AVAILABLE
            try {
                assetServiceClient.updateAssetStatus(ticket.getAssetId(), "AVAILABLE");
            } catch (Exception e) {
                // Ignore or log. For now just try.
            }
        }

        return mapToDTO(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public MaintenanceTicketDTO addNotes(Long id, MaintenanceNotesDTO notesDTO) {
        MaintenanceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance ticket not found with id: " + id));

        String existingNotes = ticket.getNotes() != null ? ticket.getNotes() + "\n" : "";
        ticket.setNotes(existingNotes + "- " + notesDTO.getNotes());

        if (ticket.getStatus() == MaintenanceStatus.RESOLVED || ticket.getStatus() == MaintenanceStatus.CLOSED) {
            ticket.setResolutionDetails(notesDTO.getNotes());
        }

        return mapToDTO(ticketRepository.save(ticket));
    }

    @Override
    public Page<MaintenanceTicketDTO> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public Page<MaintenanceTicketDTO> getMyTickets(Long userId, Pageable pageable) {
        return ticketRepository.findAll((root, query, cb) -> cb.equal(root.get("reportedByUserId"), userId), pageable)
                .map(this::mapToDTO);
    }

    @Override
    public MaintenanceTicketDTO getTicketById(Long id) {
        return ticketRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance ticket not found with id: " + id));
    }

    @Override
    public Page<MaintenanceTicketDTO> getUpcomingMaintenance(Pageable pageable) {
        return ticketRepository.findAll((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("scheduledDate"), LocalDateTime.now()), pageable)
                .map(this::mapToDTO);
    }

    private void validateStatusTransition(MaintenanceStatus current, MaintenanceStatus next) {
        if (current == next) return;
        
        switch (current) {
            case OPEN:
                if (next != MaintenanceStatus.IN_PROGRESS && next != MaintenanceStatus.CLOSED) {
                    throw new ConflictException("OPEN ticket can only transition to IN_PROGRESS or CLOSED");
                }
                break;
            case IN_PROGRESS:
                if (next != MaintenanceStatus.RESOLVED && next != MaintenanceStatus.CLOSED) {
                    throw new ConflictException("IN_PROGRESS ticket can only transition to RESOLVED or CLOSED");
                }
                break;
            case RESOLVED:
                if (next != MaintenanceStatus.CLOSED) {
                    throw new ConflictException("RESOLVED ticket can only transition to CLOSED");
                }
                break;
            case CLOSED:
                throw new ConflictException("CLOSED ticket cannot be changed");
        }
    }

    private MaintenanceTicketDTO mapToDTO(MaintenanceTicket ticket) {
        return MaintenanceTicketDTO.builder()
                .id(ticket.getId())
                .ticketId(ticket.getTicketId())
                .assetId(ticket.getAssetId())
                .reportedByUserId(ticket.getReportedByUserId())
                .technicianId(ticket.getTechnicianId())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .description(ticket.getDescription())
                .notes(ticket.getNotes())
                .resolutionDetails(ticket.getResolutionDetails())
                .cost(ticket.getCost())
                .createdAt(ticket.getCreatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .scheduledDate(ticket.getScheduledDate())
                .build();
    }
}
