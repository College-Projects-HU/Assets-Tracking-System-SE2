package com.assets.userservice.dto;

import com.assets.userservice.client.AuthUserClient;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean active;

    public static UserResponse from(AuthUserClient.AuthUserDto dto) {
        return UserResponse.builder()
                .id(dto.id)
                .fullName(dto.fullName)
                .email(dto.email)
                .role(dto.role)
                .active(dto.active)
                .build();
    }
}
