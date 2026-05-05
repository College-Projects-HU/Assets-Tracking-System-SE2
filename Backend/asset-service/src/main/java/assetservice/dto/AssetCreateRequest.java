package com.assets.assetservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AssetCreateRequest {
    @NotBlank @Size(max = 50) private String assetTag;
    @NotBlank @Size(max = 150) private String name;
    @NotBlank @Size(max = 50) private String category;
    @Size(max = 100) private String serialNumber;
    private LocalDate purchaseDate;
    @PositiveOrZero private BigDecimal purchaseCost;
    @Size(max = 150) private String location;
    private String notes;
}
