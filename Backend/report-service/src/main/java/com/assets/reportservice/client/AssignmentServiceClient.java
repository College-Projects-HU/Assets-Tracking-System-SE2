package com.assets.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "asset-service", contextId = "assignmentServiceClient")
public interface AssignmentServiceClient {

    @GetMapping("/api/internal/assignments/active")
    List<AssignmentDTO> getActiveAssignments();

    class AssignmentDTO {
        public Long id;
        public Long assetId;
        // Field names match the JSON produced by asset-service's AssignmentDTO
        public Long userId;
        public String userName;
        public String status;

        public AssignmentDTO() {}

        public AssignmentDTO(Long id, Long assetId, Long userId, String userName, String status) {
            this.id = id;
            this.assetId = assetId;
            this.userId = userId;
            this.userName = userName;
            this.status = status;
        }
    }
}
