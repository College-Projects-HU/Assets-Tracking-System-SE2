package com.assets.maintenanceservice.repository;

import com.assets.maintenanceservice.domain.TicketStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();
    List<MaintenanceTicket> findByReportedByUserIdOrderByCreatedAtDesc(Long reportedByUserId);
    List<MaintenanceTicket> findByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<MaintenanceTicket> findByScheduledAtIsNotNullOrderByScheduledAtAsc();
    long countByStatus(TicketStatus status);
}
