package com.assets.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InternalProfileUpdateRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
}
