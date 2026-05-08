package com.assets.maintenanceservice.service;

import com.assets.maintenanceservice.dto.MaintenanceNotesDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketDTO;
import com.assets.maintenanceservice.dto.MaintenanceTicketRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaintenanceService {
    MaintenanceTicketDTO createTicket(MaintenanceTicketRequestDTO requestDTO, Long userId, String userRole);
    MaintenanceTicketDTO updateTicketStatus(Long id, String status);
    MaintenanceTicketDTO addNotes(Long id, MaintenanceNotesDTO notesDTO);
    Page<MaintenanceTicketDTO> getAllTickets(Pageable pageable);
    Page<MaintenanceTicketDTO> getMyTickets(Long userId, Pageable pageable);
    MaintenanceTicketDTO getTicketById(Long id);
    Page<MaintenanceTicketDTO> getUpcomingMaintenance(Pageable pageable);
}
