package com.assets.assetservice.dto;

import com.assets.assetservice.entity.AssetStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDTO {
    private Long id;
    private String name;
    private String category;
    private AssetStatus status;
    private Long managerId;
    private Long assignedUserId;
    private String assignedUserName;
    private String location;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
}
