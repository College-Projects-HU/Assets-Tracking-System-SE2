package com.assets.maintenanceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ticketId;

    @Column(nullable = false)
    private Long assetId;

    @Column(nullable = false)
    private Long reportedByUserId;

    private Long technicianId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 2000)
    private String notes;

    @Column(length = 1000)
    private String resolutionDetails;

    private Double cost;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
    
    private LocalDateTime scheduledDate;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.ticketId == null) {
            this.ticketId = "MNT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
