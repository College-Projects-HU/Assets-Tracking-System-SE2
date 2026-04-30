package com.assets.authservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class AuditingConfig {
    // JPA Auditing is enabled for @CreatedDate and @LastModifiedDate annotations
}
