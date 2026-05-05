package com.assets.reportservice.dto;

import java.util.List;

public class DashboardStatsDTO {
    public List<AssetCategoryStatusCount> assetSummary;
    public List<AssignmentDTO> activeAssignments;
    public MaintenanceCostDTO maintenanceCosts;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(List<AssetCategoryStatusCount> assetSummary, List<AssignmentDTO> activeAssignments, MaintenanceCostDTO maintenanceCosts) {
        this.assetSummary = assetSummary;
        this.activeAssignments = activeAssignments;
        this.maintenanceCosts = maintenanceCosts;
    }
}
