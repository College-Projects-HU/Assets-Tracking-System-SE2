package com.assets.maintenanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "asset-service", url = "${feign.asset-service.url:http://localhost:8082}")
public interface AssetServiceClient {

    @PutMapping("/api/internal/assets/{id}/status")
    void updateAssetStatus(@PathVariable("id") Long assetId, @RequestBody AssetStatusUpdateRequest request);

    record AssetStatusUpdateRequest(String status, String reason) {}
}
