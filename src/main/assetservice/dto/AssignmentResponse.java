package com.assets.assetservice.dto;

import com.assets.assetservice.entity.AssetAssignment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class AssignmentResponse {
    private Long id;
    private Long assetId;
    private Long assigneeUserId;
    private Long assignedBy;
    private LocalDateTime assignedAt;
    private LocalDateTime returnedAt;
    private String notes;

    public static AssignmentResponse from(AssetAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId()).assetId(a.getAssetId()).assigneeUserId(a.getAssigneeUserId())
                .assignedBy(a.getAssignedBy()).assignedAt(a.getAssignedAt())
                .returnedAt(a.getReturnedAt()).notes(a.getNotes())
                .build();
    }
}
