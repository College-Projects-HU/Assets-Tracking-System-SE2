package com.example.userservice.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;

public class RoleValidator implements ConstraintValidator<ValidRole, String> {

    private final List<String> allowedRoles = Arrays.asList("ROLE_USER", "ROLE_ADMIN", "ROLE_EMPLOYEE");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        return allowedRoles.contains(value);
    }
}
