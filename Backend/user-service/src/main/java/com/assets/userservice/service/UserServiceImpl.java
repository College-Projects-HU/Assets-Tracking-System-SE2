package com.example.userservice.service;

import com.example.userservice.dto.UpdateProfileDto;
import com.example.userservice.dto.UpdateRoleDto;
import com.example.userservice.dto.UserProfileDto;
import com.example.userservice.entity.User;
import com.example.userservice.exception.ResourceNotFoundException;
import com.example.userservice.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserProfileDto getProfile(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String currentUserEmail, UpdateProfileDto dto) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));
        
        user.setName(dto.getName());
        user.setEmail(dto.getEmail()); // Depending on requirements, changing email might require re-auth
        
        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Override
    public List<UserProfileDto> getAllUsers(String roleFilter, Boolean activeFilter) {
        List<User> users;
        
        if (roleFilter != null) {
            users = userRepository.findByRoleAndActiveTrue(roleFilter); // Assuming we filter active implicitly if not specified, or implement more complex logic
        } else if (Boolean.TRUE.equals(activeFilter)) {
            users = userRepository.findByActiveTrue();
        } else {
            users = userRepository.findAll(); // If no filters, return all (even inactive if Admin needs them)
        }
        
        return users.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserProfileDto changeUserRole(Long id, UpdateRoleDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        user.setRole(dto.getRole());
        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Override
    @Transactional
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        user.setActive(false);
        userRepository.save(user);
    }
    
    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }
}
