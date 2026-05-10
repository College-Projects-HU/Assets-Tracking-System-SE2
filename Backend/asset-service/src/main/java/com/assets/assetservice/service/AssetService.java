package com.assets.assetservice.service;

import com.assets.assetservice.dto.AssetDTO;
import com.assets.assetservice.dto.AssetRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetService {
    AssetDTO createAsset(AssetRequestDTO requestDTO, Long managerId);
    AssetDTO updateAsset(Long id, AssetRequestDTO requestDTO);
    AssetDTO getAssetById(Long id);
    void deleteAsset(Long id);
    Page<AssetDTO> getAllAssets(String category, String status, Long assignedUserId, Long managerId, Pageable pageable);
    AssetDTO updateAssetStatus(Long id, String status);
    java.util.Map<String, Object> bulkImport(org.springframework.web.multipart.MultipartFile file);
}
