package com.assets.assetservice.controller;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.dto.AssetResponse;
import com.assets.assetservice.service.AssetService;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/assets")
@RequiredArgsConstructor
public class InternalAssetOperationsController {
    private final AssetService assetService;

    @PutMapping("/{id}/status")
    public AssetResponse updateStatus(@PathVariable Long id, @RequestBody InternalAssetStatusRequest request) {
        return assetService.changeStatus(id, request.getStatus(), request.getReason());
    }

    @Data
    public static class InternalAssetStatusRequest {
        @NotNull
        private AssetStatus status;
        private String reason;
    }
}
