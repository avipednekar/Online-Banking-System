package com.onlinebanking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

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

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void securedEndpointRejectsAnonymousRequest() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unauthorized"))
                .andExpect(jsonPath("$.path").value("/api/accounts"));
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
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    @Test
    void currentUserReturnsCustomerProfileWithPendingKyc() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mia",
                                  "email": "mia@example.com",
                                  "password": "Password@123",
                                  "fullName": "Mia Fernandez",
                                  "phoneNumber": "9998887776",
                                  "gender": "FEMALE",
                                  "occupation": "Designer",
                                  "addressLine1": "7 Palm Residency",
                                  "addressLine2": "Block C",
                                  "city": "Pune",
                                  "state": "Maharashtra",
                                  "postalCode": "411001",
                                  "country": "India",
                                  "dateOfBirth": "1996-04-21"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode authResponse = objectMapper.readTree(registration.getResponse().getContentAsString());
        String token = authResponse.get("data").get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("mia"))
                .andExpect(jsonPath("$.data.email").value("mia@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Mia Fernandez"))
                .andExpect(jsonPath("$.data.phoneNumber").value("9998887776"))
                .andExpect(jsonPath("$.data.gender").value("FEMALE"))
                .andExpect(jsonPath("$.data.occupation").value("Designer"))
                .andExpect(jsonPath("$.data.addressLine1").value("7 Palm Residency"))
                .andExpect(jsonPath("$.data.addressLine2").value("Block C"))
                .andExpect(jsonPath("$.data.city").value("Pune"))
                .andExpect(jsonPath("$.data.state").value("Maharashtra"))
                .andExpect(jsonPath("$.data.postalCode").value("411001"))
                .andExpect(jsonPath("$.data.country").value("India"))
                .andExpect(jsonPath("$.data.dateOfBirth").value("1996-04-21"))
                .andExpect(jsonPath("$.data.kycStatus").value("PENDING"));
    }

    @Test
    void invalidLoginPayloadReturnsStructuredValidationErrors() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "bad user",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fields.username").exists())
                .andExpect(jsonPath("$.fields.password").exists());
    }
}
