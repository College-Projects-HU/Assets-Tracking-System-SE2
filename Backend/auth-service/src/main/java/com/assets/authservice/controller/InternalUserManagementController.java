package com.assets.authservice.controller;

import com.assets.authservice.dto.InternalProfileUpdateRequest;
import com.assets.authservice.dto.InternalRoleUpdateRequest;
import com.assets.authservice.dto.InternalUserResponse;
import com.assets.authservice.service.InternalUserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserManagementController {
    private final InternalUserManagementService service;

    @GetMapping
    public List<InternalUserResponse> list() {
        return service.getAllUsers();
    }

    @GetMapping("/{id}")
    public InternalUserResponse get(@PathVariable Long id) {
        return service.getUser(id);
    }

    @PutMapping("/{id}/profile")
    public InternalUserResponse updateProfile(@PathVariable Long id, @Valid @RequestBody InternalProfileUpdateRequest request) {
        return service.updateProfile(id, request);
    }

    @PutMapping("/{id}/role")
    public InternalUserResponse updateRole(@PathVariable Long id, @Valid @RequestBody InternalRoleUpdateRequest request) {
        return service.updateRole(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
