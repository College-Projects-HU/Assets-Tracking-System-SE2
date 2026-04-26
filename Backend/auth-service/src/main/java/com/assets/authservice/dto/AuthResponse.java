package com.assets.authservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @NotBlank(message = "Access token is required")
    private String accessToken;

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;

    @NotBlank(message = "Token type is required")
    private String tokenType = "Bearer";

    @NotNull(message = "Expires in is required")
    @Min(value = 0, message = "Expires in must be greater than or equal to 0")
    private Long expiresIn;
}
