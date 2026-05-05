package com.assets.assetservice.dto;

import com.assets.assetservice.domain.AssetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetStatusChangeRequest {
    @NotNull private AssetStatus status;
    private String reason;
}
