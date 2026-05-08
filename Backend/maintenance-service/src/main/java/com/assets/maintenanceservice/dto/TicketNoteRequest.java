package com.assets.maintenanceservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketNoteRequest {
    @NotBlank
    private String note;
}
