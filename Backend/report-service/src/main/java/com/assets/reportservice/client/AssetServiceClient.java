package com.assets.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "asset-service", url = "${feign.asset-service.url:http://localhost:8082}")
public interface AssetServiceClient {

    @GetMapping("/api/internal/assets")
    List<AssetDTO> getAllAssets();

    class AssetDTO {
        public Long id;
        public String category;
        public String status;
        public Long assignedUserId;
        public String assignedUserName;
        public String location;
        public String warrantyExpiry; // ISO date

        public AssetDTO() {}

        public AssetDTO(Long id, String category, String status) {
            this.id = id;
            this.category = category;
            this.status = status;
        }
    }
}
