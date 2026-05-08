package com.assets.userservice.service;

import com.assets.userservice.client.AuthUserClient;
import com.assets.userservice.dto.ProfileUpdateRequest;
import com.assets.userservice.dto.RoleUpdateRequest;
import com.assets.userservice.dto.UserResponse;
import com.assets.userservice.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDirectoryService {
    private final AuthUserClient authUserClient;

    public UserResponse getProfile() {
        return UserResponse.from(authUserClient.getUser(CurrentUser.id()));
    }

    public UserResponse updateProfile(ProfileUpdateRequest request) {
        return UserResponse.from(authUserClient.updateProfile(CurrentUser.id(), new AuthUserClient.ProfileUpdateRequest(request.getFullName())));
    }

    public List<UserResponse> listUsers(String role, Boolean active, String q) {
        return authUserClient.getAllUsers().stream()
                .filter(user -> role == null || role.isBlank() || user.role.equalsIgnoreCase(normalizeRole(role)))
                .filter(user -> active == null || user.active == active)
                .filter(user -> q == null || q.isBlank() ||
                        user.fullName.toLowerCase().contains(q.toLowerCase()) ||
                        user.email.toLowerCase().contains(q.toLowerCase()))
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getById(Long id) {
        return UserResponse.from(authUserClient.getUser(id));
    }

    public UserResponse updateRole(Long id, RoleUpdateRequest request) {
        return UserResponse.from(authUserClient.updateRole(id, new AuthUserClient.RoleUpdateRequest(normalizeRole(request.getRole()))));
    }

    public void deactivate(Long id) {
        authUserClient.deactivate(id);
    }

    private String normalizeRole(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
