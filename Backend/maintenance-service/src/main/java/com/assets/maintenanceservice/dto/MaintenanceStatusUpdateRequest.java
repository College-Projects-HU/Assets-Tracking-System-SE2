package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.domain.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaintenanceStatusUpdateRequest {
    @NotNull
    private TicketStatus status;
    private String resolutionDetails;
    private Long technicianUserId;
    private BigDecimal maintenanceCost;
}
