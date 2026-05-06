package com.assets.maintenanceservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceNotesDTO {
    @NotBlank(message = "Notes cannot be blank")
    private String notes;
}
