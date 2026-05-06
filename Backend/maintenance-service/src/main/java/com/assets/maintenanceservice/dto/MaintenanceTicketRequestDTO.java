package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicketRequestDTO {
    @NotNull(message = "Asset ID cannot be null")
    private Long assetId;

    @NotNull(message = "Priority cannot be null")
    private Priority priority;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private LocalDateTime scheduledDate;
}
