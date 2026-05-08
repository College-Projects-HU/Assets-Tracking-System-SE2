package com.assets.maintenanceservice.controller;

import com.assets.maintenanceservice.dto.*;
import com.assets.maintenanceservice.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER','EMPLOYEE')")
    public ResponseEntity<MaintenanceTicketResponse> create(@Valid @RequestBody CreateMaintenanceTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public List<MaintenanceTicketResponse> listAll() {
        return maintenanceService.listAll();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER','EMPLOYEE')")
    public List<MaintenanceTicketResponse> myTickets() {
        return maintenanceService.myTickets();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER','EMPLOYEE')")
    public MaintenanceTicketResponse get(@PathVariable Long id) {
        return maintenanceService.get(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public MaintenanceTicketResponse updateStatus(@PathVariable Long id, @Valid @RequestBody MaintenanceStatusUpdateRequest request) {
        return maintenanceService.updateStatus(id, request);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER','EMPLOYEE')")
    public TicketNoteResponse addNote(@PathVariable Long id, @Valid @RequestBody TicketNoteRequest request) {
        return maintenanceService.addNote(id, request);
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public List<MaintenanceTicketResponse> upcoming() {
        return maintenanceService.upcoming();
    }
}
