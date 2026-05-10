package com.assets.assetservice.controller;

import com.assets.assetservice.dto.AssignmentDTO;
import com.assets.assetservice.dto.AssignmentRequestDTO;
import com.assets.assetservice.entity.AssignmentStatus;
import com.assets.assetservice.service.AssignmentService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
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
public class AssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssignmentService assignmentService;

    @Autowired
    private ObjectMapper objectMapper;

    private AssignmentDTO testAssignmentDTO;
    private AssignmentRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testAssignmentDTO = AssignmentDTO.builder()
                .id(1L)
                .assetId(10L)
                .userId(100L)
                .status(AssignmentStatus.ACTIVE)
                .build();

        testRequestDTO = AssignmentRequestDTO.builder()
                .assetId(10L)
                .userId(100L)
                .userName("John Doe")
                .build();
    }

    @Test
    void assignAsset_ReturnsCreatedAssignment() throws Exception {
        when(assignmentService.assignAsset(any(AssignmentRequestDTO.class))).thenReturn(testAssignmentDTO);

        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetId").value(10L));
    }

    @Test
    void returnAsset_ReturnsUpdatedAssignment() throws Exception {
        testAssignmentDTO.setStatus(AssignmentStatus.RETURNED);
        when(assignmentService.returnAsset(1L)).thenReturn(testAssignmentDTO);

        mockMvc.perform(put("/api/assignments/1/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"));
    }

    @Test
    void getAllAssignments_ReturnsPage() throws Exception {
        Page<AssignmentDTO> page = new PageImpl<>(Collections.singletonList(testAssignmentDTO));
        when(assignmentService.getAllAssignments(any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].assetId").value(10L));
    }
}
