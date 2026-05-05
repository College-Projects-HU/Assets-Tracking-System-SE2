package com.assets.assetservice.dto;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.entity.Asset;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class AssetResponse {
    private Long id;
    private String assetTag;
    private String name;
    private String category;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private String location;
    private AssetStatus status;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssetResponse from(Asset a) {
        return AssetResponse.builder()
                .id(a.getId()).assetTag(a.getAssetTag()).name(a.getName())
                .category(a.getCategory()).serialNumber(a.getSerialNumber())
                .purchaseDate(a.getPurchaseDate()).purchaseCost(a.getPurchaseCost())
                .location(a.getLocation()).status(a.getStatus()).notes(a.getNotes())
                .createdBy(a.getCreatedBy()).createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .build();
    }
}
