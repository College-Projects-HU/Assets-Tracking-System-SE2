package com.assets.reportservice.dto;

import java.util.Map;

public class MaintenanceCostDTO {
    public double totalCost;
    public Map<String, Double> byCategory;

    public MaintenanceCostDTO() {}

    public MaintenanceCostDTO(double totalCost, Map<String, Double> byCategory) {
        this.totalCost = totalCost;
        this.byCategory = byCategory;
    }
}
