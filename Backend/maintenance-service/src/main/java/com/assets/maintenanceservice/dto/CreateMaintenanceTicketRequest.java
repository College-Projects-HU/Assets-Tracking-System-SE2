package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.domain.TicketPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateMaintenanceTicketRequest {
    @NotNull
    private Long assetId;

    @NotBlank
    private String issueDescription;

    @NotNull
    private TicketPriority priority;

    @FutureOrPresent
    private LocalDateTime scheduledAt;
}
