package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.entity.MaintenanceStatus;
import com.assets.maintenanceservice.entity.Priority;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicketDTO {
    private Long id;
    private String ticketId;
    private Long assetId;
    private Long reportedByUserId;
    private Long technicianId;
    private MaintenanceStatus status;
    private Priority priority;
    private String description;
    private String notes;
    private String resolutionDetails;
    private Double cost;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime scheduledDate;
}
