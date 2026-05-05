package com.assets.notificationservice.service;

import com.assets.notificationservice.dto.NotificationRequestDTO;
import com.assets.notificationservice.dto.NotificationResponseDTO;
import com.assets.notificationservice.entity.Notification;
import com.assets.notificationservice.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationResponseDTO createNotification(NotificationRequestDTO request) {
        Notification notification = new Notification();
        notification.setRecipientId(request.recipientId);
        notification.setMessage(request.message);
        notification.setType(request.type);
        notification.setReadStatus(false);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotifications(Long recipientId) {
        return notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponseDTO markAsRead(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setReadStatus(true);
        notification.setReadAt(LocalDateTime.now());
        return toDto(notificationRepository.save(notification));
    }

    private NotificationResponseDTO toDto(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getRecipientId(),
                notification.getMessage(),
                notification.getType(),
                notification.isReadStatus(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}