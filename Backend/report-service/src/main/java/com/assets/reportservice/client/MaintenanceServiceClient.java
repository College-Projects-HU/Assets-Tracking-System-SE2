package com.assets.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "maintenance-service", url = "${feign.maintenance-service.url:http://localhost:8085}")
public interface MaintenanceServiceClient {

    @GetMapping("/api/internal/maintenances")
    List<MaintenanceDTO> getAllMaintenances();

    class MaintenanceDTO {
        public Long id;
        public Long assetId;
        public double cost;
        public String category;

        public MaintenanceDTO() {}

        public MaintenanceDTO(Long id, Long assetId, double cost, String category) {
            this.id = id;
            this.assetId = assetId;
            this.cost = cost;
            this.category = category;
        }
    }
}
