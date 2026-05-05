package com.assets.notificationservice.dto;

import java.time.LocalDateTime;

public class NotificationResponseDTO {
    public Long id;
    public Long recipientId;
    public String message;
    public String type;
    public boolean readStatus;
    public LocalDateTime createdAt;
    public LocalDateTime readAt;

    public NotificationResponseDTO() {
    }

    public NotificationResponseDTO(Long id, Long recipientId, String message, String type, boolean readStatus, LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
        this.readStatus = readStatus;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }
}