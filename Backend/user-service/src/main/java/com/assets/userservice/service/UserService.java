package com.example.userservice.service;

import com.example.userservice.dto.UpdateProfileDto;
import com.example.userservice.dto.UpdateRoleDto;
import com.example.userservice.dto.UserProfileDto;

import java.util.List;

public interface UserService {
    
    UserProfileDto getProfile(String currentUserEmail);
    
    UserProfileDto updateProfile(String currentUserEmail, UpdateProfileDto dto);
    
    List<UserProfileDto> getAllUsers(String roleFilter, Boolean activeFilter);
    
    UserProfileDto changeUserRole(Long id, UpdateRoleDto dto);
    
    void softDeleteUser(Long id);
}
