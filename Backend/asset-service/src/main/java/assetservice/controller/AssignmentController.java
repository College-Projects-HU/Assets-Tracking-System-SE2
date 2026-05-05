package com.assets.assetservice.controller;

import com.assets.assetservice.dto.AssignmentRequest;
import com.assets.assetservice.dto.AssignmentResponse;
import com.assets.assetservice.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<AssignmentResponse> assign(@Valid @RequestBody AssignmentRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.assign(r));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public AssignmentResponse returnAsset(@PathVariable Long id) {
        return service.returnAsset(id);
    }

    @GetMapping("/asset/{assetId}")
    @PreAuthorize("isAuthenticated()")
    public List<AssignmentResponse> history(@PathVariable Long assetId) {
        return service.historyForAsset(assetId);
    }

    @GetMapping("/user/{userId}/active")
    @PreAuthorize("isAuthenticated()")
    public List<AssignmentResponse> active(@PathVariable Long userId) {
        return service.activeForUser(userId);
    }
}
