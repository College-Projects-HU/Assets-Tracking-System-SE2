package com.assets.maintenanceservice.controller;

import com.assets.maintenanceservice.dto.InternalMaintenanceDto;
import com.assets.maintenanceservice.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/internal/maintenances")
@RequiredArgsConstructor
public class InternalMaintenanceController {
    private final MaintenanceService maintenanceService;

    @GetMapping
    public List<InternalMaintenanceDto> list() {
        return maintenanceService.internalMaintenances();
    }
}
