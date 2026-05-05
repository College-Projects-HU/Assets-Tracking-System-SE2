package com.assets.reportservice.dto;

public class InventoryItemDTO {
    public Long id;
    public String category;
    public String status;
    public Long assignedUserId;
    public String assignedUserName;
    public String location;
    public String warrantyExpiry; // ISO date string or null

    public InventoryItemDTO() {}

    public InventoryItemDTO(Long id, String category, String status, Long assignedUserId, String assignedUserName, String location, String warrantyExpiry) {
        this.id = id;
        this.category = category;
        this.status = status;
        this.assignedUserId = assignedUserId;
        this.assignedUserName = assignedUserName;
        this.location = location;
        this.warrantyExpiry = warrantyExpiry;
    }
}
