package com.assets.assetservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequestDTO {
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "User name is required")
    private String userName;

    private LocalDate expectedReturnDate;
    private String notes;
}
