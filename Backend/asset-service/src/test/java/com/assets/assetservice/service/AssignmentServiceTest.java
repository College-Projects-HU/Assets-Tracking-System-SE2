package com.assets.assetservice.service;

import com.assets.assetservice.dto.AssignmentDTO;
import com.assets.assetservice.dto.AssignmentRequestDTO;
import com.assets.assetservice.entity.Asset;
import com.assets.assetservice.entity.AssetStatus;
import com.assets.assetservice.entity.Assignment;
import com.assets.assetservice.entity.AssignmentStatus;
import com.assets.assetservice.exception.ConflictException;
import com.assets.assetservice.exception.ResourceNotFoundException;
import com.assets.assetservice.repository.AssetRepository;
import com.assets.assetservice.repository.AssignmentRepository;
import com.assets.assetservice.service.impl.AssignmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssignmentServiceImpl assignmentService;

    private Asset testAsset;
    private Assignment testAssignment;
    private AssignmentRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        testAsset = Asset.builder()
                .id(1L)
                .status(AssetStatus.AVAILABLE)
                .name("Monitor")
                .build();

        testAssignment = Assignment.builder()
                .id(1L)
                .asset(testAsset)
                .userId(100L)
                .userName("John Doe")
                .status(AssignmentStatus.ACTIVE)
                .assignedDate(LocalDate.now())
                .build();

        requestDTO = AssignmentRequestDTO.builder()
                .assetId(1L)
                .userId(100L)
                .userName("John Doe")
                .build();
    }

    @Test
    void assignAsset_Success() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));
        when(assignmentRepository.existsByAssetIdAndStatus(1L, AssignmentStatus.ACTIVE)).thenReturn(false);
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);

        AssignmentDTO result = assignmentService.assignAsset(requestDTO);

        assertNotNull(result);
        assertEquals(AssignmentStatus.ACTIVE, result.getStatus());
        assertEquals(AssetStatus.ASSIGNED, testAsset.getStatus());
        verify(assetRepository, times(1)).save(testAsset);
    }

    @Test
    void assignAsset_AssetNotAvailable() {
        testAsset.setStatus(AssetStatus.UNDER_MAINTENANCE);
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));

        assertThrows(ConflictException.class, () -> assignmentService.assignAsset(requestDTO));
    }

    @Test
    void assignAsset_AlreadyAssigned() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));
        when(assignmentRepository.existsByAssetIdAndStatus(1L, AssignmentStatus.ACTIVE)).thenReturn(true);

        assertThrows(ConflictException.class, () -> assignmentService.assignAsset(requestDTO));
    }

    @Test
    void returnAsset_Success() {
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(testAssignment));
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);

        AssignmentDTO result = assignmentService.returnAsset(1L);

        assertNotNull(result);
        assertEquals(AssignmentStatus.RETURNED, testAssignment.getStatus());
        assertEquals(AssetStatus.AVAILABLE, testAsset.getStatus());
        verify(assetRepository, times(1)).save(testAsset);
    }

    @Test
    void returnAsset_AlreadyReturned() {
        testAssignment.setStatus(AssignmentStatus.RETURNED);
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(testAssignment));

        assertThrows(ConflictException.class, () -> assignmentService.returnAsset(1L));
    }
}
