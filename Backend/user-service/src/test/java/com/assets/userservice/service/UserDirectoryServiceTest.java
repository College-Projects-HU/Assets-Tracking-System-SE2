package com.assets.userservice.service;

import com.assets.userservice.client.AuthUserClient;
import com.assets.userservice.dto.ProfileUpdateRequest;
import com.assets.userservice.dto.RoleUpdateRequest;
import com.assets.userservice.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDirectoryServiceTest {
    @Mock
    private AuthUserClient authUserClient;

    @InjectMocks
    private UserDirectoryService userDirectoryService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getProfileUsesCurrentUserId() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(7L, "user@example.com", "ROLE_EMPLOYEE"), null, List.of())
        );
        AuthUserClient.AuthUserDto dto = new AuthUserClient.AuthUserDto();
        dto.id = 7L;
        dto.fullName = "John Doe";
        dto.email = "user@example.com";
        dto.role = "ROLE_EMPLOYEE";
        dto.active = true;
        when(authUserClient.getUser(7L)).thenReturn(dto);

        var response = userDirectoryService.getProfile();

        assertEquals(7L, response.getId());
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    void updateRoleNormalizesRoleName() {
        AuthUserClient.AuthUserDto dto = new AuthUserClient.AuthUserDto();
        dto.id = 1L;
        dto.role = "ROLE_ASSET_MANAGER";
        when(authUserClient.updateRole(any(), any())).thenReturn(dto);

        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRole("ASSET_MANAGER");
        userDirectoryService.updateRole(1L, request);

        verify(authUserClient).updateRole(any(), any());
    }

    @Test
    void updateProfilePassesFullName() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(3L, "user@example.com", "ROLE_EMPLOYEE"), null, List.of())
        );
        AuthUserClient.AuthUserDto dto = new AuthUserClient.AuthUserDto();
        dto.id = 3L;
        dto.fullName = "Updated Name";
        when(authUserClient.updateProfile(any(), any())).thenReturn(dto);

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFullName("Updated Name");
        var response = userDirectoryService.updateProfile(request);

        assertEquals("Updated Name", response.getFullName());
    }
}
