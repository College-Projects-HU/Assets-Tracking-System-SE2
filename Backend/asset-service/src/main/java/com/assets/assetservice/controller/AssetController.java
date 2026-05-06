package com.assets.assetservice.controller;

import com.assets.assetservice.dto.AssetDTO;
import com.assets.assetservice.dto.AssetRequestDTO;
import com.assets.assetservice.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping("/assets")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssetDTO> createAsset(@Valid @RequestBody AssetRequestDTO requestDTO) {
        return new ResponseEntity<>(assetService.createAsset(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/assets")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<Page<AssetDTO>> getAllAssets(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "assignedUserId", required = false) Long assignedUserId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(assetService.getAllAssets(category, status, assignedUserId, pageable));
    }

    @GetMapping("/assets/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssetDTO> getAssetById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PutMapping("/assets/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssetDTO> updateAsset(@PathVariable("id") Long id, @Valid @RequestBody AssetRequestDTO requestDTO) {
        return ResponseEntity.ok(assetService.updateAsset(id, requestDTO));
    }

    @DeleteMapping("/assets/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<Void> deleteAsset(@PathVariable("id") Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/assets/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<AssetDTO> updateAssetStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return ResponseEntity.ok(assetService.updateAssetStatus(id, status));
    }

    // Endpoint for internal Feign calls
    @GetMapping("/internal/assets")
    public ResponseEntity<List<AssetDTO>> getAllInternalAssets() {
        return ResponseEntity.ok(assetService.getAllAssets(null, null, null, Pageable.unpaged()).getContent());
    }

    @PostMapping("/assets/bulk-import")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<Map<String, Object>> bulkImportAssets(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(assetService.bulkImport(file));
    }
}
