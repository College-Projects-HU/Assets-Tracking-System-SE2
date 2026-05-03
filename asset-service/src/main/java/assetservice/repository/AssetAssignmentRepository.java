package com.assets.assetservice.repository;

import com.assets.assetservice.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    Optional<AssetAssignment> findFirstByAssetIdAndReturnedAtIsNull(Long assetId);
    List<AssetAssignment> findByAssigneeUserIdAndReturnedAtIsNull(Long userId);
    List<AssetAssignment> findByAssetIdOrderByAssignedAtDesc(Long assetId);
}
