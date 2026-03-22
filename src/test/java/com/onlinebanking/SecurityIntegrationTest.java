package com.onlinebanking;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void securedEndpointRejectsAnonymousRequest() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerReturnsJwtToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "emma",
                                  "email": "emma@example.com",
                                  "password": "Password@123",
                                  "fullName": "Emma Watson",
                                  "phoneNumber": "9876543210",
                                  "gender": "FEMALE",
                                  "occupation": "Analyst",
                                  "addressLine1": "221B Baker Street",
                                  "addressLine2": "Apt 4",
                                  "city": "Mumbai",
                                  "state": "Maharashtra",
                                  "postalCode": "400001",
                                  "country": "India",
                                  "dateOfBirth": "1997-08-10"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("USER"));
    }
}
