package com.assets.assetservice.service.impl;

import com.assets.assetservice.dto.AssetDTO;
import com.assets.assetservice.dto.AssetRequestDTO;
import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetStatus;
import com.assets.assetservice.exception.ConflictException;
import com.assets.assetservice.exception.ResourceNotFoundException;
import com.assets.assetservice.repository.AssetRepository;
import com.assets.assetservice.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    @Override
    @Transactional
    public AssetDTO createAsset(AssetRequestDTO requestDTO) {
        Asset asset = Asset.builder()
                .name(requestDTO.getName())
                .category(requestDTO.getCategory())
                .location(requestDTO.getLocation())
                .purchaseDate(requestDTO.getPurchaseDate())
                .warrantyExpiry(requestDTO.getWarrantyExpiry())
                .status(AssetStatus.AVAILABLE)
                .build();
        asset = assetRepository.save(asset);
        return mapToDTO(asset);
    }

    @Override
    @Transactional
    public AssetDTO updateAsset(Long id, AssetRequestDTO requestDTO) {
        Asset asset = getAssetEntity(id);
        asset.setName(requestDTO.getName());
        asset.setCategory(requestDTO.getCategory());
        asset.setLocation(requestDTO.getLocation());
        asset.setPurchaseDate(requestDTO.getPurchaseDate());
        asset.setWarrantyExpiry(requestDTO.getWarrantyExpiry());
        return mapToDTO(assetRepository.save(asset));
    }

    @Override
    public AssetDTO getAssetById(Long id) {
        return mapToDTO(getAssetEntity(id));
    }

    @Override
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = getAssetEntity(id);
        assetRepository.delete(asset);
    }

    @Override
    public Page<AssetDTO> getAllAssets(String category, String status, Long assignedUserId, Pageable pageable) {
        Specification<Asset> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), AssetStatus.valueOf(status)));
            }
            if (assignedUserId != null) {
                predicates.add(cb.equal(root.get("assignedUserId"), assignedUserId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return assetRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public AssetDTO updateAssetStatus(Long id, String statusStr) {
        Asset asset = getAssetEntity(id);
        AssetStatus newStatus;
        try {
            newStatus = AssetStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ConflictException("Invalid status: " + statusStr);
        }

        validateStatusTransition(asset.getStatus(), newStatus);
        asset.setStatus(newStatus);

        if (newStatus == AssetStatus.AVAILABLE || newStatus == AssetStatus.RETIRED) {
            asset.setAssignedUserId(null);
            asset.setAssignedUserName(null);
        }

        return mapToDTO(assetRepository.save(asset));
    }

    @Override
    @Transactional
    public java.util.Map<String, Object> bulkImport(org.springframework.web.multipart.MultipartFile file) {
        int total = 0;
        int inserted = 0;
        int skipped = 0;
        List<String> skippedReasons = new ArrayList<>();

        try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }
                total++;
                String[] values = line.split(",");
                if (values.length < 4) {
                    skipped++;
                    skippedReasons.add("Row " + total + ": Missing columns. Expected at least name, category, purchaseDate, warrantyExpiry.");
                    continue;
                }
                try {
                    Asset asset = Asset.builder()
                            .name(values[0].trim())
                            .category(values[1].trim())
                            .location(values.length > 4 ? values[4].trim() : null)
                            .purchaseDate(java.time.LocalDate.parse(values[2].trim()))
                            .warrantyExpiry(java.time.LocalDate.parse(values[3].trim()))
                            .status(AssetStatus.AVAILABLE)
                            .build();
                    assetRepository.save(asset);
                    inserted++;
                } catch (Exception e) {
                    skipped++;
                    skippedReasons.add("Row " + total + ": " + e.getMessage());
                }
            }
        } catch (java.io.IOException e) {
            throw new ConflictException("Failed to read CSV file: " + e.getMessage());
        }

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("total", total);
        summary.put("inserted", inserted);
        summary.put("skipped", skipped);
        summary.put("skippedReasons", skippedReasons);
        return summary;
    }

    private void validateStatusTransition(AssetStatus currentStatus, AssetStatus newStatus) {
        if (currentStatus == newStatus) return;

        boolean valid = false;
        switch (currentStatus) {
            case AVAILABLE:
                valid = (newStatus == AssetStatus.ASSIGNED || newStatus == AssetStatus.UNDER_MAINTENANCE || newStatus == AssetStatus.RETIRED);
                break;
            case ASSIGNED:
                valid = (newStatus == AssetStatus.AVAILABLE || newStatus == AssetStatus.UNDER_MAINTENANCE || newStatus == AssetStatus.RETIRED);
                break;
            case UNDER_MAINTENANCE:
                valid = (newStatus == AssetStatus.AVAILABLE || newStatus == AssetStatus.RETIRED);
                break;
            case RETIRED:
                // No transitioning out of RETIRED
                break;
        }

        if (!valid) {
            throw new ConflictException("Illegal status transition from " + currentStatus + " to " + newStatus);
        }
    }

    private Asset getAssetEntity(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    private AssetDTO mapToDTO(Asset asset) {
        return AssetDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .category(asset.getCategory())
                .status(asset.getStatus())
                .assignedUserId(asset.getAssignedUserId())
                .assignedUserName(asset.getAssignedUserName())
                .location(asset.getLocation())
                .purchaseDate(asset.getPurchaseDate())
                .warrantyExpiry(asset.getWarrantyExpiry())
                .build();
    }
}
