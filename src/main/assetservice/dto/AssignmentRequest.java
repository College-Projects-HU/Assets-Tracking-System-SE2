package com.assets.assetservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignmentRequest {
    @NotNull private Long assetId;
    @NotNull private Long assigneeUserId;
    private String notes;
}
