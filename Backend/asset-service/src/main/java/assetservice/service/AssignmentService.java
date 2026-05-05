package com.assets.assetservice.service;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.dto.AssignmentRequest;
import com.assets.assetservice.dto.AssignmentResponse;
import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetAssignment;
import com.assets.assetservice.exception.ConflictException;
import com.assets.assetservice.exception.NotFoundException;
import com.assets.assetservice.repository.AssetAssignmentRepository;
import com.assets.assetservice.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {
    private final AssetAssignmentRepository repo;
    private final AssetService assetService;

    @Transactional
    public AssignmentResponse assign(AssignmentRequest r) {
        Asset a = assetService.find(r.getAssetId());
        if (a.getStatus() != AssetStatus.AVAILABLE)
            throw new ConflictException("Asset is not AVAILABLE (current=" + a.getStatus() + ")");
        repo.findFirstByAssetIdAndReturnedAtIsNull(a.getId()).ifPresent(x -> {
            throw new ConflictException("Asset already has an active assignment");
        });
        AssetAssignment as = AssetAssignment.builder()
                .assetId(a.getId()).assigneeUserId(r.getAssigneeUserId())
                .assignedBy(CurrentUser.id()).notes(r.getNotes()).build();
        as = repo.save(as);
        assetService.changeStatus(a.getId(), AssetStatus.ASSIGNED, "Assigned to user " + r.getAssigneeUserId());
        log.info("Asset {} assigned to user {}", a.getId(), r.getAssigneeUserId());
        return AssignmentResponse.from(as);
    }

    @Transactional
    public AssignmentResponse returnAsset(Long assignmentId) {
        AssetAssignment as = repo.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Assignment not found: " + assignmentId));
        if (as.getReturnedAt() != null)
            throw new ConflictException("Assignment already returned");
        as.setReturnedAt(LocalDateTime.now());
        repo.save(as);
        assetService.changeStatus(as.getAssetId(), AssetStatus.AVAILABLE, "Returned by user " + as.getAssigneeUserId());
        return AssignmentResponse.from(as);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> historyForAsset(Long assetId) {
        return repo.findByAssetIdOrderByAssignedAtDesc(assetId).stream().map(AssignmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> activeForUser(Long userId) {
        return repo.findByAssigneeUserIdAndReturnedAtIsNull(userId).stream().map(AssignmentResponse::from).toList();
    }
}
