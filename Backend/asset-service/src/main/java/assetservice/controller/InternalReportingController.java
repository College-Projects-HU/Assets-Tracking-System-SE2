package com.assets.assetservice.controller;

import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetAssignment;
import com.assets.assetservice.repository.AssetAssignmentRepository;
import com.assets.assetservice.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalReportingController {
    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assignmentRepository;

    @GetMapping("/assets")
    @PreAuthorize("isAuthenticated()")
    public List<InternalAssetDto> assets() {
        return assetRepository.findAll().stream()
                .map(this::toAssetDto)
                .toList();
    }

    @GetMapping("/assignments/active")
    @PreAuthorize("isAuthenticated()")
    public List<InternalAssignmentDto> activeAssignments() {
        return assignmentRepository.findAll().stream()
                .filter(assignment -> assignment.getReturnedAt() == null)
                .map(this::toAssignmentDto)
                .toList();
    }

    private InternalAssetDto toAssetDto(Asset asset) {
        Long assignedUserId = assignmentRepository.findFirstByAssetIdAndReturnedAtIsNull(asset.getId())
                .map(AssetAssignment::getAssigneeUserId)
                .orElse(null);

        return new InternalAssetDto(
                asset.getId(),
                asset.getCategory(),
                asset.getStatus().name(),
                assignedUserId,
                null,
                asset.getLocation(),
                asset.getPurchaseDate() == null ? null : asset.getPurchaseDate().format(DateTimeFormatter.ISO_DATE)
        );
    }

    private InternalAssignmentDto toAssignmentDto(AssetAssignment assignment) {
        return new InternalAssignmentDto(
                assignment.getId(),
                assignment.getAssetId(),
                assignment.getAssigneeUserId(),
                null,
                "ACTIVE"
        );
    }

    public record InternalAssetDto(
            Long id,
            String category,
            String status,
            Long assignedUserId,
            String assignedUserName,
            String location,
            String warrantyExpiry
    ) {}

    public record InternalAssignmentDto(
            Long id,
            Long assetId,
            Long assigneeId,
            String assigneeName,
            String status
    ) {}
}
