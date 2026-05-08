package com.assets.assetservice.dto;

import com.assets.assetservice.entity.AssignmentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDTO {
    private Long id;
    private Long assetId;
    private String assetName;
    private Long userId;
    private String userName;
    private LocalDate assignedDate;
    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;
    private AssignmentStatus status;
    private String notes;
}
