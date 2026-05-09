package com.assets.assetservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data @AllArgsConstructor
public class CsvImportResult {
    private int totalRows;
    private int imported;
    private int failed;
    private List<String> errors;
}
