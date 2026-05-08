package com.assets.maintenanceservice.repository;

import com.assets.maintenanceservice.entity.TicketNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketNoteRepository extends JpaRepository<TicketNote, Long> {
    List<TicketNote> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
