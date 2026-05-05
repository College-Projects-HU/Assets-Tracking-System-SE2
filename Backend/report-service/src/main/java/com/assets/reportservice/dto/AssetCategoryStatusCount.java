package com.assets.reportservice.dto;

import java.util.Map;

public class AssetCategoryStatusCount {
    public String category;
    public Map<String, Integer> statusCounts;

    public AssetCategoryStatusCount() {}

    public AssetCategoryStatusCount(String category, Map<String, Integer> statusCounts) {
        this.category = category;
        this.statusCounts = statusCounts;
    }
}
