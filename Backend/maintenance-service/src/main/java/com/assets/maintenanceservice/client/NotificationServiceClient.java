package com.assets.maintenanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/internal/maintenance")
    void notifyMaintenance(@RequestBody NotificationRequest request);

    class NotificationRequest {
        public Long recipientId;
        public String message;
        public String type;

        public NotificationRequest(Long recipientId, String message, String type) {
            this.recipientId = recipientId;
            this.message = message;
            this.type = type;
        }
    }
}
