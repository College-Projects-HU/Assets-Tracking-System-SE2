package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.domain.TicketPriority;
import com.assets.maintenanceservice.domain.TicketStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MaintenanceTicketResponse {
    private Long id;
    private String ticketCode;
    private Long assetId;
    private Long reportedByUserId;
    private Long technicianUserId;
    private TicketPriority priority;
    private TicketStatus status;
    private String issueDescription;
    private String resolutionDetails;
    private BigDecimal maintenanceCost;
    private LocalDateTime scheduledAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketNoteResponse> notes;

    public static MaintenanceTicketResponse from(MaintenanceTicket ticket, List<TicketNoteResponse> notes) {
        return MaintenanceTicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .assetId(ticket.getAssetId())
                .reportedByUserId(ticket.getReportedByUserId())
                .technicianUserId(ticket.getTechnicianUserId())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .issueDescription(ticket.getIssueDescription())
                .resolutionDetails(ticket.getResolutionDetails())
                .maintenanceCost(ticket.getMaintenanceCost())
                .scheduledAt(ticket.getScheduledAt())
                .resolvedAt(ticket.getResolvedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .notes(notes)
                .build();
    }
}
