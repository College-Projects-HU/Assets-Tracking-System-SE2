package com.assets.reportservice.dto;

import java.time.LocalDateTime;

public class AuditLogDTO {
    public Long id;
    public String actor;
    public String action;
    public String details;
    public String resourceType;
    public String resourceId;
    public LocalDateTime createdAt;

    public AuditLogDTO() {
    }

    public AuditLogDTO(Long id, String actor, String action, String details, String resourceType, String resourceId, LocalDateTime createdAt) {
        this.id = id;
        this.actor = actor;
        this.action = action;
        this.details = details;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.createdAt = createdAt;
    }
}
