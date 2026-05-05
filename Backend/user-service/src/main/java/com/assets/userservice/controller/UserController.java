package com.example.userservice.controller;

import com.example.userservice.dto.UpdateProfileDto;
import com.example.userservice.dto.UpdateRoleDto;
import com.example.userservice.dto.UserProfileDto;
import com.example.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        // IDOR Protection: Extract identity from JWT (Authentication context)
        String currentUserEmail = authentication.getName();
        return ResponseEntity.ok(userService.getProfile(currentUserEmail));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDto updateProfileDto) {
        // IDOR Protection: Extract identity from JWT (Authentication context)
        String currentUserEmail = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(currentUserEmail, updateProfileDto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileDto>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(userService.getAllUsers(role, active));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleDto updateRoleDto) {
        return ResponseEntity.ok(userService.changeUserRole(id, updateRoleDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> softDeleteUser(@PathVariable Long id) {
        userService.softDeleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
