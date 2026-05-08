package com.assets.assetservice.repository;

import com.assets.assetservice.entity.Assignment;
import com.assets.assetservice.entity.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long>, JpaSpecificationExecutor<Assignment> {
    List<Assignment> findByUserIdAndStatus(Long userId, AssignmentStatus status);
    boolean existsByAssetIdAndStatus(Long assetId, AssignmentStatus status);
    boolean existsByUserIdAndStatus(Long userId, AssignmentStatus status);
}
