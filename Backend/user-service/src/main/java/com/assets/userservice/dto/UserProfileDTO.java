package com.assets.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    @NotBlank(message = "Full name cannot be blank")
    private String fullName;
}
