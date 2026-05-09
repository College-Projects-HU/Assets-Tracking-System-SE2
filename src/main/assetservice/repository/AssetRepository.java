package com.assets.assetservice.repository;

import com.assets.assetservice.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    Optional<Asset> findByAssetTag(String assetTag);
    boolean existsByAssetTag(String assetTag);
}
