package com.assets.notificationservice.dto;

public class NotificationRequestDTO {
    public Long recipientId;
    public String message;
    public String type;

    public NotificationRequestDTO() {
    }

    public NotificationRequestDTO(Long recipientId, String message, String type) {
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
    }
}