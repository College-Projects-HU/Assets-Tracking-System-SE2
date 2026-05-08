package com.assets.assetservice.controller;

import com.assets.assetservice.dto.AssetDTO;
import com.assets.assetservice.dto.AssetRequestDTO;
import com.assets.assetservice.entity.AssetStatus;
import com.assets.assetservice.service.AssetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false"
})
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(roles = "ASSET_MANAGER")
public class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssetService assetService;

    @Autowired
    private ObjectMapper objectMapper;

    private AssetDTO testAssetDTO;
    private AssetRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testAssetDTO = AssetDTO.builder()
                .id(1L)
                .name("Test Asset")
                .category("Laptop")
                .status(AssetStatus.AVAILABLE)
                .build();

        testRequestDTO = AssetRequestDTO.builder()
                .name("Test Asset")
                .category("Laptop")
                .purchaseDate(LocalDate.now().minusDays(1))
                .warrantyExpiry(LocalDate.now().plusYears(1))
                .build();
    }

    @Test
    void createAsset_ReturnsCreatedAsset() throws Exception {
        when(assetService.createAsset(any(AssetRequestDTO.class), any())).thenReturn(testAssetDTO);

        mockMvc.perform(post("/api/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Asset"));
    }

    @Test
    void getAllAssets_ReturnsPage() throws Exception {
        Page<AssetDTO> page = new PageImpl<>(Collections.singletonList(testAssetDTO));
        when(assetService.getAllAssets(any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Asset"));
    }

    @Test
    void getAssetById_ReturnsAsset() throws Exception {
        when(assetService.getAssetById(1L)).thenReturn(testAssetDTO);

        mockMvc.perform(get("/api/assets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Asset"));
    }

    @Test
    void updateAssetStatus_ReturnsUpdatedAsset() throws Exception {
        testAssetDTO.setStatus(AssetStatus.ASSIGNED);
        when(assetService.updateAssetStatus(eq(1L), any(String.class))).thenReturn(testAssetDTO);

        mockMvc.perform(put("/api/assets/1/status")
                        .param("status", "ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));
    }

    @Test
    void bulkImportAssets_ReturnsSummary() throws Exception {
        Map<String, Object> summary = new HashMap<>();
        summary.put("total", 1);
        summary.put("inserted", 1);

        when(assetService.bulkImport(any())).thenReturn(summary);

        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "name,category,date,expiry\nTest,Laptop,2023-01-01,2025-01-01".getBytes());

        mockMvc.perform(multipart("/api/assets/bulk-import")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }
}
