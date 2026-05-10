package com.assets.assetservice.controller;

import com.assets.assetservice.dto.AssignmentDTO;
import com.assets.assetservice.dto.AssignmentRequestDTO;
import com.assets.assetservice.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssignmentDTO> assignAsset(@Valid @RequestBody AssignmentRequestDTO requestDTO) {
        return new ResponseEntity<>(assignmentService.assignAsset(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssignmentDTO> returnAsset(@PathVariable("id") Long id) {
        return ResponseEntity.ok(assignmentService.returnAsset(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<Page<AssignmentDTO>> getAllAssignments(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "status", required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(assignmentService.getAllAssignments(userId, status, pageable));
    }

    /**
     * Internal endpoint — called by report-service via Feign (no gateway, no auth headers).
     * Returns all active (ACTIVE status) assignments for dashboard stats.
     */
    @GetMapping("/internal/assignments/active")
    public ResponseEntity<java.util.List<AssignmentDTO>> getActiveAssignmentsInternal() {
        return ResponseEntity.ok(
                assignmentService.getAllAssignments(null, "ACTIVE", Pageable.unpaged()).getContent()
        );
    }
}
