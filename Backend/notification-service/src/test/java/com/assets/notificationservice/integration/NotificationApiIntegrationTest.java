package com.assets.notificationservice.integration;

import com.assets.notificationservice.entity.Notification;
import com.assets.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false"
})
@AutoConfigureMockMvc(addFilters = false)
class NotificationApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationRepository notificationRepository;

    @Test
    void notificationLifecycleWorksThroughMvc() throws Exception {
        Notification saved = new Notification();
        saved.setRecipientId(7L);
        saved.setMessage("Assignment created");
        saved.setType("ASSIGNMENT");
        saved.setReadStatus(false);
        saved.setCreatedAt(LocalDateTime.of(2026, 5, 1, 10, 0));

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);
        when(notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(7L)).thenReturn(Collections.singletonList(saved));
        when(notificationRepository.findByIdAndRecipientId(1L, 7L)).thenReturn(Optional.of(saved));

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"recipientId\":7,\"message\":\"Assignment created\",\"type\":\"ASSIGNMENT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipientId").value(7));

        mockMvc.perform(get("/api/notifications").header("X-User-Id", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("Assignment created"));

        mockMvc.perform(put("/api/notifications/1/read").header("X-User-Id", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.readStatus").value(true));
    }
}
