package com.assets.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${feign.user-service.url:http://localhost:8082}")
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    // DTO for user response
    class UserDTO {
        public Long id;
        public String email;
        public String fullName;

        public UserDTO() {}

        public UserDTO(Long id, String email, String fullName) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
        }
    }
}
