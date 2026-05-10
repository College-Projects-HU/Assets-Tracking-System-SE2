package com.assets.assetservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "report-service")
public interface ReportServiceClient {

    @PostMapping("/api/reports/audit-log")
    AuditLogDTO logAudit(@RequestBody AuditLogRequest request);

    class AuditLogRequest {
        public String actor;
        public String action;
        public String details;
        public String resourceType;
        public String resourceId;

        public AuditLogRequest() {
        }

        public AuditLogRequest(String actor, String action, String details, String resourceType, String resourceId) {
            this.actor = actor;
            this.action = action;
            this.details = details;
            this.resourceType = resourceType;
            this.resourceId = resourceId;
        }
    }

    class AuditLogDTO {
        public Long id;
        public String actor;
        public String action;
        public String details;
        public String resourceType;
        public String resourceId;
        public String createdAt;
    }
}
