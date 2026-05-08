package com.assets.userservice.integration;

import com.assets.userservice.client.AuthUserClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false"
})
@AutoConfigureMockMvc(addFilters = false)
class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthUserClient authUserClient;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListUsers() throws Exception {
        AuthUserClient.AuthUserDto dto = new AuthUserClient.AuthUserDto();
        dto.id = 1L;
        dto.fullName = "Admin User";
        dto.email = "admin@example.com";
        dto.role = "ROLE_ADMIN";
        dto.active = true;
        when(authUserClient.getAllUsers()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void userCanUpdateOwnProfile() throws Exception {
        AuthUserClient.AuthUserDto dto = new AuthUserClient.AuthUserDto();
        dto.id = 0L;
        dto.fullName = "Updated User";
        dto.email = "user@example.com";
        dto.role = "ROLE_EMPLOYEE";
        dto.active = true;
        when(authUserClient.updateProfile(anyLong(), any())).thenReturn(dto);

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("fullName", "Updated User"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated User"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDeactivateUser() throws Exception {
        doNothing().when(authUserClient).deactivate(5L);

        mockMvc.perform(delete("/api/users/5"))
                .andExpect(status().isNoContent());
    }
}
