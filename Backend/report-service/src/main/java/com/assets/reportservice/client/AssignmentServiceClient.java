package com.assets.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "assignment-service", url = "${feign.assignment-service.url:http://localhost:8087}")
public interface AssignmentServiceClient {

    @GetMapping("/api/internal/assignments/active")
    List<AssignmentDTO> getActiveAssignments();

    class AssignmentDTO {
        public Long id;
        public Long assetId;
        public Long assigneeId;
        public String assigneeName;
        public String status;

        public AssignmentDTO() {}

        public AssignmentDTO(Long id, Long assetId, Long assigneeId, String assigneeName, String status) {
            this.id = id;
            this.assetId = assetId;
            this.assigneeId = assigneeId;
            this.assigneeName = assigneeName;
            this.status = status;
        }
    }
}
