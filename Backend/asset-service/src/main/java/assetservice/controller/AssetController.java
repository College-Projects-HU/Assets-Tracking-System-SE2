package com.assets.assetservice.controller;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.dto.*;
import com.assets.assetservice.service.AssetCsvImportService;
import com.assets.assetservice.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService service;
    private final AssetCsvImportService csv;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<AssetResponse> create(@Valid @RequestBody AssetCreateRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<AssetResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return service.search(q, status, category, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public AssetResponse get(@PathVariable Long id) { return service.get(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public AssetResponse update(@PathVariable Long id, @Valid @RequestBody AssetUpdateRequest r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public AssetResponse changeStatus(@PathVariable Long id, @Valid @RequestBody AssetStatusChangeRequest r) {
        return service.changeStatus(id, r.getStatus(), r.getReason());
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public CsvImportResult importCsv(@RequestParam("file") MultipartFile file) {
        return csv.importCsv(file);
    }
}
