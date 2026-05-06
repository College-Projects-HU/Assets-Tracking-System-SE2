package com.assets.assetservice.service;

import com.assets.assetservice.dto.AssetDTO;
import com.assets.assetservice.dto.AssetRequestDTO;
import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetStatus;
import com.assets.assetservice.exception.ConflictException;
import com.assets.assetservice.exception.ResourceNotFoundException;
import com.assets.assetservice.repository.AssetRepository;
import com.assets.assetservice.service.impl.AssetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssetServiceImpl assetService;

    private Asset testAsset;
    private AssetRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testAsset = Asset.builder()
                .id(1L)
                .name("MacBook Pro")
                .category("Laptop")
                .location("HQ")
                .status(AssetStatus.AVAILABLE)
                .purchaseDate(LocalDate.now().minusDays(10))
                .warrantyExpiry(LocalDate.now().plusYears(1))
                .build();

        testRequestDTO = AssetRequestDTO.builder()
                .name("MacBook Pro")
                .category("Laptop")
                .location("HQ")
                .purchaseDate(LocalDate.now().minusDays(10))
                .warrantyExpiry(LocalDate.now().plusYears(1))
                .build();
    }

    @Test
    void createAsset_Success() {
        when(assetRepository.save(any(Asset.class))).thenReturn(testAsset);

        AssetDTO result = assetService.createAsset(testRequestDTO);

        assertNotNull(result);
        assertEquals(testAsset.getName(), result.getName());
        assertEquals(AssetStatus.AVAILABLE, result.getStatus());
        verify(assetRepository, times(1)).save(any(Asset.class));
    }

    @Test
    void getAssetById_Success() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));

        AssetDTO result = assetService.getAssetById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getAssetById_NotFound() {
        when(assetRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assetService.getAssetById(1L));
    }

    @Test
    void updateAssetStatus_ValidTransition() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));
        when(assetRepository.save(any(Asset.class))).thenReturn(testAsset);

        AssetDTO result = assetService.updateAssetStatus(1L, "ASSIGNED");

        assertEquals(AssetStatus.ASSIGNED, result.getStatus());
        verify(assetRepository).save(testAsset);
    }

    @Test
    void updateAssetStatus_InvalidTransition() {
        testAsset.setStatus(AssetStatus.RETIRED);
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));

        assertThrows(ConflictException.class, () -> assetService.updateAssetStatus(1L, "AVAILABLE"));
    }

    @Test
    void getAllAssets_ReturnsPage() {
        Page<Asset> page = new PageImpl<>(List.of(testAsset));
        when(assetRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<AssetDTO> result = assetService.getAllAssets(null, null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
