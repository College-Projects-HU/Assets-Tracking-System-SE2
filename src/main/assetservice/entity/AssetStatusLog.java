package com.assets.assetservice.entity;

import com.assets.assetservice.domain.AssetStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_status_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssetStatusLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Enumerated(EnumType.STRING) @Column(name = "from_status", length = 20)
    private AssetStatus fromStatus;

    @Enumerated(EnumType.STRING) @Column(name = "to_status", nullable = false, length = 20)
    private AssetStatus toStatus;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
}
