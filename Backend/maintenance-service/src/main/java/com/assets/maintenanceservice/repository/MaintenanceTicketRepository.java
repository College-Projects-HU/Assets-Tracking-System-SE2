package com.assets.maintenanceservice.repository;

import com.assets.maintenanceservice.entity.MaintenanceStatus;
import com.assets.maintenanceservice.entity.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long>, JpaSpecificationExecutor<MaintenanceTicket> {
    Optional<MaintenanceTicket> findByTicketId(String ticketId);
    boolean existsByAssetIdAndStatusIn(Long assetId, List<MaintenanceStatus> statuses);
}
