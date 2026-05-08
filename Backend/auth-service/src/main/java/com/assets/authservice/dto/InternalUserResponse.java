package com.assets.authservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InternalUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean active;
}
