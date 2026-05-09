package com.assets.assetservice.service;

import com.assets.assetservice.dto.AssetCreateRequest;
import com.assets.assetservice.dto.CsvImportResult;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetCsvImportService {
    private final AssetService assetService;

    @Value("${asset.csv.max-rows:10000}")
    private int maxRows;

    /**
     * CSV header (case-sensitive):
     * assetTag,name,category,serialNumber,purchaseDate,purchaseCost,location,notes
     */
    public CsvImportResult importCsv(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int total = 0, ok = 0, fail = 0;
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = reader.readAll();
            if (rows.isEmpty()) return new CsvImportResult(0, 0, 0, List.of("Empty CSV"));
            String[] header = rows.get(0);
            if (rows.size() - 1 > maxRows) return new CsvImportResult(rows.size()-1, 0, rows.size()-1,
                    List.of("Too many rows (max " + maxRows + ")"));
            for (int i = 1; i < rows.size(); i++) {
                total++;
                String[] row = rows.get(i);
                try {
                    AssetCreateRequest r = mapRow(header, row);
                    assetService.create(r);
                    ok++;
                } catch (Exception ex) {
                    fail++;
                    errors.add("Row " + (i+1) + ": " + ex.getMessage());
                }
            }
        } catch (IOException | CsvException e) {
            return new CsvImportResult(total, ok, total - ok, List.of("CSV read error: " + e.getMessage()));
        }
        return new CsvImportResult(total, ok, fail, errors);
    }

    private AssetCreateRequest mapRow(String[] h, String[] row) {
        AssetCreateRequest r = new AssetCreateRequest();
        for (int i = 0; i < h.length && i < row.length; i++) {
            String key = h[i].trim();
            String val = row[i] == null ? "" : row[i].trim();
            if (val.isEmpty()) continue;
            switch (key) {
                case "assetTag" -> r.setAssetTag(val);
                case "name" -> r.setName(val);
                case "category" -> r.setCategory(val);
                case "serialNumber" -> r.setSerialNumber(val);
                case "purchaseDate" -> r.setPurchaseDate(LocalDate.parse(val));
                case "purchaseCost" -> r.setPurchaseCost(new BigDecimal(val));
                case "location" -> r.setLocation(val);
                case "notes" -> r.setNotes(val);
                default -> {}
            }
        }
        return r;
    }
}
