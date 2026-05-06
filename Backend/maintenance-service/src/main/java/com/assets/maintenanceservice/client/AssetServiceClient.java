package com.assets.maintenanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "asset-service")
public interface AssetServiceClient {

    @GetMapping("/api/assets/{id}")
    AssetDTO getAssetById(@PathVariable("id") Long id);

    @PutMapping("/api/assets/{id}/status")
    AssetDTO updateAssetStatus(@PathVariable("id") Long id, @RequestParam("status") String status);

    class AssetDTO {
        public Long id;
        public String status;
        public Long assignedUserId;
    }
}
