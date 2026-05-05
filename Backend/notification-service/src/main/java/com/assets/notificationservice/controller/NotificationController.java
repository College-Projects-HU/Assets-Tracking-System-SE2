package com.assets.notificationservice.controller;

import com.assets.notificationservice.dto.NotificationRequestDTO;
import com.assets.notificationservice.dto.InternalNotificationRequestDTO;
import com.assets.notificationservice.dto.NotificationResponseDTO;
import com.assets.notificationservice.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> createNotification(@RequestBody NotificationRequestDTO request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @PostMapping("/internal/assignment")
    public ResponseEntity<NotificationResponseDTO> createAssignmentTrigger(@RequestBody InternalNotificationRequestDTO request) {
        return ResponseEntity.ok(notificationService.createNotification(new NotificationRequestDTO(request.recipientId, request.message, request.type)));
    }

    @PostMapping("/internal/maintenance")
    public ResponseEntity<NotificationResponseDTO> createMaintenanceTrigger(@RequestBody InternalNotificationRequestDTO request) {
        return ResponseEntity.ok(notificationService.createNotification(new NotificationRequestDTO(request.recipientId, request.message, request.type)));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications(@RequestHeader(name = "X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable(name = "id") Long id, @RequestHeader(name = "X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }
}