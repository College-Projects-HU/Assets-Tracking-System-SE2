package com.assets.maintenanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @GetMapping("/internal/auth/users")
    List<UserDTO> getAllUsers();

    class UserDTO {
        public Long id;
        public String fullName;
        public String email;
        public RoleDTO role;
        public Boolean enabled;
    }

    class RoleDTO {
        public Long id;
        public String name;
    }
}
