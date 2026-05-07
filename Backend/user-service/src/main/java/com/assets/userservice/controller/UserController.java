package com.assets.userservice.controller;

import com.assets.userservice.client.AuthServiceClient;
import com.assets.userservice.dto.UserProfileDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PreAuthorize("hasRole('ADMIN')")
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
            @RequestParam("role") String role) {
        return ResponseEntity.ok(authServiceClient.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        authServiceClient.updateStatus(id, false);
        return ResponseEntity.noContent().build();
    }
}
