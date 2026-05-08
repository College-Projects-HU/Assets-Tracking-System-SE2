package com.assets.maintenanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "asset-service")
public interface AssetServiceClient {

    // Use /internal/* endpoints — these bypass @PreAuthorize so no gateway
    // auth headers are needed for service-to-service Feign calls.
    @GetMapping("/api/internal/assets/{id}")
    AssetDTO getAssetById(@PathVariable("id") Long id);

    @PutMapping("/api/internal/assets/{id}/status")
    AssetDTO updateAssetStatus(@PathVariable("id") Long id, @RequestParam("status") String status);

    class AssetDTO {
        public Long id;
        public String status;
        public Long assignedUserId;
    }
}
