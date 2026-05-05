package com.assets.reportservice.dto;

public class AssignmentDTO {
    public Long id;
    public Long assetId;
    public Long assigneeId;
    public String assigneeName;
    public String status;

    public AssignmentDTO() {}

    public AssignmentDTO(Long id, Long assetId, Long assigneeId, String assigneeName, String status) {
        this.id = id;
        this.assetId = assetId;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.status = status;
    }
}
