package com.assets.userservice.controller;

import com.assets.userservice.client.AuthServiceClient;
import com.assets.userservice.dto.UserProfileDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthServiceClient authServiceClient;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthServiceClient.UserDTO> getMyProfile(@RequestHeader(value = "X-User-Email", required = false) String email) {
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(authServiceClient.getUserByEmail(email));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthServiceClient.UserDTO> updateMyProfile(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @Valid @RequestBody UserProfileDTO profileDTO) {
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(authServiceClient.updateProfile(email, Map.of("fullName", profileDTO.getFullName())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<List<AuthServiceClient.UserDTO>> getAllUsers(@RequestParam(value = "role", required = false) String role) {
        List<AuthServiceClient.UserDTO> users = authServiceClient.getAllUsers();
        if (role != null) {
            users = users.stream().filter(u -> u.role != null && role.equalsIgnoreCase(u.role.name)).collect(Collectors.toList());
        }
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthServiceClient.UserDTO> updateUserRole(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId,
            @RequestParam("role") String role) {
        forbidSelfPrivilegeEdit(currentUserId, id);
        return ResponseEntity.ok(authServiceClient.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId) {
        forbidSelfPrivilegeEdit(currentUserId, id);
        authServiceClient.updateStatus(id, false);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthServiceClient.UserDTO> activateUser(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId) {
        forbidSelfPrivilegeEdit(currentUserId, id);
        return ResponseEntity.ok(authServiceClient.updateStatus(id, true));
    }

    private void forbidSelfPrivilegeEdit(String currentUserId, Long targetUserId) {
        if (currentUserId == null || currentUserId.isBlank() || targetUserId == null) {
            return;
        }
        try {
            if (Long.parseLong(currentUserId.trim()) == targetUserId) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Admin cannot modify their own role or activation status");
            }
        } catch (NumberFormatException ignored) {
            // Ignore malformed header and defer to existing authorization checks.
        }
    }
}
