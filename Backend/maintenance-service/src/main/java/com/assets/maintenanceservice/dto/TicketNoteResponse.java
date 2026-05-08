package com.assets.maintenanceservice.dto;

import com.assets.maintenanceservice.entity.TicketNote;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketNoteResponse {
    private Long id;
    private Long authorUserId;
    private String note;
    private LocalDateTime createdAt;

    public static TicketNoteResponse from(TicketNote note) {
        return TicketNoteResponse.builder()
                .id(note.getId())
                .authorUserId(note.getAuthorUserId())
                .note(note.getNote())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
