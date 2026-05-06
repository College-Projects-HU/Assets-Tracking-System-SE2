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
public class AssetRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    private String location;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Warranty expiry is required")
    private LocalDate warrantyExpiry;
}
