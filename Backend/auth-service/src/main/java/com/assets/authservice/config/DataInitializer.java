package com.assets.authservice.config;

import com.assets.authservice.entity.Role;
import com.assets.authservice.entity.User;
import com.assets.authservice.repository.RoleRepository;
import com.assets.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            // Initialize roles
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                Role adminRole = new Role();
                adminRole.setName("ROLE_ADMIN");
                adminRole.setDescription("Administrator role");
                roleRepository.save(adminRole);
                log.info("ROLE_ADMIN created");
            }

            if (roleRepository.findByName("ROLE_EMPLOYEE").isEmpty()) {
                Role employeeRole = new Role();
                employeeRole.setName("ROLE_EMPLOYEE");
                employeeRole.setDescription("Employee role");
                roleRepository.save(employeeRole);
                log.info("ROLE_EMPLOYEE created");
            }

            if (roleRepository.findByName("ROLE_ASSET_MANAGER").isEmpty()) {
                Role assetManagerRole = new Role();
                assetManagerRole.setName("ROLE_ASSET_MANAGER");
                assetManagerRole.setDescription("Asset Manager role");
                roleRepository.save(assetManagerRole);
                log.info("ROLE_ASSET_MANAGER created");
            }

            // Create default admin user if not exists
            if (userRepository.findByEmail("admin@assets.com").isEmpty()) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("Admin role not found"));

                User adminUser = new User();
                adminUser.setFullName("System Administrator");
                adminUser.setEmail("admin@assets.com");
                adminUser.setPassword(passwordEncoder.encode("Admin@123"));
                adminUser.setRole(adminRole);
                adminUser.setEnabled(true);

                userRepository.save(adminUser);
                log.info("Admin user created");
            }
        };
    }
}
