package com.assets.notificationservice.dto;

public class InternalNotificationRequestDTO {
    public Long recipientId;
    public String message;
    public String type;
    public String referenceId;

    public InternalNotificationRequestDTO() {
    }

    public InternalNotificationRequestDTO(Long recipientId, String message, String type, String referenceId) {
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
    }
}