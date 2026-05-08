package com.assets.maintenanceservice.dto;

public record InternalMaintenanceDto(
        Long id,
        Long assetId,
        double cost,
        String category
) {}
