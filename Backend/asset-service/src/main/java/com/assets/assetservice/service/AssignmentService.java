package com.assets.assetservice.service;

import com.assets.assetservice.dto.AssignmentDTO;
import com.assets.assetservice.dto.AssignmentRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssignmentService {
    AssignmentDTO assignAsset(AssignmentRequestDTO requestDTO);
    AssignmentDTO returnAsset(Long assignmentId);
    Page<AssignmentDTO> getAllAssignments(Long userId, String status, Pageable pageable);
}
