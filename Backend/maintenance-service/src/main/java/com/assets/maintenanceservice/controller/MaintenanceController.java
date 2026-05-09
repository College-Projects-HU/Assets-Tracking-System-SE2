package com.assets.maintenanceservice.controller;

import com.assets.maintenanceservice.dto.MaintenanceNotesDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketRequestDTO;
import com.assets.maintenanceservice.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<MaintenanceTicketDTO> createTicket(
            @Valid @RequestBody MaintenanceTicketRequestDTO requestDTO,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        return new ResponseEntity<>(maintenanceService.createTicket(requestDTO, userId, userRole), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicketDTO> updateTicketStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(maintenanceService.updateTicketStatus(id, status));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasRole('ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicketDTO> addNotes(
            @PathVariable("id") Long id,
            @Valid @RequestBody MaintenanceNotesDTO notesDTO) {
        return ResponseEntity.ok(maintenanceService.addNotes(id, notesDTO));
    }

    /**
     * GET /api/maintenance
     * - ASSET_MANAGER → all tickets
     * - EMPLOYEE → only their own tickets (scoped by X-User-Id)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER')")
    public ResponseEntity<Page<MaintenanceTicketDTO>> getAllTickets(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        String role = userRole == null ? "" : userRole.toUpperCase().replace("ROLE_", "");
        if ("EMPLOYEE".equals(role) && userId != null) {
            return ResponseEntity.ok(maintenanceService.getMyTickets(userId, pageable));
        }
        return ResponseEntity.ok(maintenanceService.getAllTickets(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Page<MaintenanceTicketDTO>> getMyTickets(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.getMyTickets(userId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicketDTO> getTicketById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(maintenanceService.getTicketById(id));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('ASSET_MANAGER')")
    public ResponseEntity<Page<MaintenanceTicketDTO>> getUpcomingMaintenance(
            @PageableDefault(size = 20, sort = "scheduledDate") Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.getUpcomingMaintenance(pageable));
    }
}
