package com.assets.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InternalRoleUpdateRequest {
    @NotBlank
    private String role;
}
