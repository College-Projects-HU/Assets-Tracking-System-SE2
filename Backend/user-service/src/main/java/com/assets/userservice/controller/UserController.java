package com.assets.userservice.controller;

import com.assets.userservice.dto.ProfileUpdateRequest;
import com.assets.userservice.dto.RoleUpdateRequest;
import com.assets.userservice.dto.UserResponse;
import com.assets.userservice.service.UserDirectoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserDirectoryService userDirectoryService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public UserResponse getProfile() {
        return userDirectoryService.getProfile();
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return userDirectoryService.updateProfile(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public List<UserResponse> listUsers(@RequestParam(required = false) String role,
                                        @RequestParam(required = false) Boolean active,
                                        @RequestParam(required = false) String q) {
        return userDirectoryService.listUsers(role, active, q);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public UserResponse getById(@PathVariable Long id) {
        return userDirectoryService.getById(id);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        return userDirectoryService.updateRole(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userDirectoryService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
