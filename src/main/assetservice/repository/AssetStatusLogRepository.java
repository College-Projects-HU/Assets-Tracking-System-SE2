package com.assets.assetservice.repository;

import com.assets.assetservice.entity.AssetStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetStatusLogRepository extends JpaRepository<AssetStatusLog, Long> {
    List<AssetStatusLog> findByAssetIdOrderByChangedAtDesc(Long assetId);
}
