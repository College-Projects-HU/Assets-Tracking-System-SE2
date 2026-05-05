package com.assets.assetservice.service;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.dto.*;
import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetStatusLog;
import com.assets.assetservice.exception.ConflictException;
import com.assets.assetservice.exception.IllegalStateTransitionException;
import com.assets.assetservice.exception.NotFoundException;
import com.assets.assetservice.repository.AssetRepository;
import com.assets.assetservice.repository.AssetStatusLogRepository;
import com.assets.assetservice.security.CurrentUser;
import com.assets.assetservice.spec.AssetSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetService {
    private final AssetRepository repo;
    private final AssetStatusLogRepository logRepo;

    @Transactional
    public AssetResponse create(AssetCreateRequest r) {
        if (repo.existsByAssetTag(r.getAssetTag()))
            throw new ConflictException("Asset tag already exists: " + r.getAssetTag());
        Asset a = new Asset();
        BeanUtils.copyProperties(r, a);
        a.setStatus(AssetStatus.AVAILABLE);
        a.setCreatedBy(CurrentUser.id());
        a = repo.save(a);
        log.info("Asset created id={} tag={} by user={}", a.getId(), a.getAssetTag(), a.getCreatedBy());
        return AssetResponse.from(a);
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> search(String q, AssetStatus status, String category, Pageable pageable) {
        Specification<Asset> spec = Specification.allOf(
                AssetSpecifications.search(q),
                AssetSpecifications.hasStatus(status),
                AssetSpecifications.hasCategory(category));
        return repo.findAll(spec, pageable).map(AssetResponse::from);
    }

    @Transactional(readOnly = true)
    public AssetResponse get(Long id) {
        return AssetResponse.from(find(id));
    }

    public Asset find(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Asset not found: " + id));
    }

    @Transactional
    public AssetResponse update(Long id, AssetUpdateRequest r) {
        Asset a = find(id);
        if (r.getName() != null) a.setName(r.getName());
        if (r.getCategory() != null) a.setCategory(r.getCategory());
        if (r.getSerialNumber() != null) a.setSerialNumber(r.getSerialNumber());
        if (r.getPurchaseDate() != null) a.setPurchaseDate(r.getPurchaseDate());
        if (r.getPurchaseCost() != null) a.setPurchaseCost(r.getPurchaseCost());
        if (r.getLocation() != null) a.setLocation(r.getLocation());
        if (r.getNotes() != null) a.setNotes(r.getNotes());
        return AssetResponse.from(repo.save(a));
    }

    @Transactional
    public void delete(Long id) {
        Asset a = find(id);
        if (a.getStatus() == AssetStatus.ASSIGNED)
            throw new ConflictException("Cannot delete an ASSIGNED asset; return it first.");
        repo.delete(a);
        log.info("Asset deleted id={}", id);
    }

    @Transactional
    public AssetResponse changeStatus(Long id, AssetStatus target, String reason) {
        Asset a = find(id);
        AssetStatus current = a.getStatus();
        if (current == target) return AssetResponse.from(a);
        if (!current.canTransitionTo(target))
            throw new IllegalStateTransitionException(
                    "Illegal status transition: " + current + " -> " + target);
        a.setStatus(target);
        repo.save(a);
        logRepo.save(AssetStatusLog.builder()
                .assetId(a.getId()).fromStatus(current).toStatus(target)
                .changedBy(CurrentUser.id()).reason(reason).build());
        log.info("Asset {} status {} -> {} by user={}", id, current, target, CurrentUser.id());
        return AssetResponse.from(a);
    }
}
