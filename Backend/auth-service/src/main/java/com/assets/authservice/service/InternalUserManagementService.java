package com.assets.authservice.service;

import com.assets.authservice.dto.InternalProfileUpdateRequest;
import com.assets.authservice.dto.InternalRoleUpdateRequest;
import com.assets.authservice.dto.InternalUserResponse;
import com.assets.authservice.entity.Role;
import com.assets.authservice.entity.User;
import com.assets.authservice.repository.RoleRepository;
import com.assets.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class InternalUserManagementService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<InternalUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public InternalUserResponse getUser(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public InternalUserResponse updateProfile(Long id, InternalProfileUpdateRequest request) {
        User user = find(id);
        user.setFullName(request.getFullName());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public InternalUserResponse updateRole(Long id, InternalRoleUpdateRequest request) {
        User user = find(id);
        String normalizedRole = normalizeRole(request.getRole());
        Role role = roleRepository.findByName(normalizedRole)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Role not found: " + normalizedRole));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id) {
        User user = find(id);
        user.setEnabled(false);
        userRepository.save(user);
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found: " + id));
    }

    private String normalizeRole(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }

    private InternalUserResponse toResponse(User user) {
        return InternalUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .active(Boolean.TRUE.equals(user.getEnabled()))
                .build();
    }
}
