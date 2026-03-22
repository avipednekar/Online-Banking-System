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
        String token = authResponse.get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("mia"))
                .andExpect(jsonPath("$.email").value("mia@example.com"))
                .andExpect(jsonPath("$.fullName").value("Mia Fernandez"))
                .andExpect(jsonPath("$.phoneNumber").value("9998887776"))
                .andExpect(jsonPath("$.gender").value("FEMALE"))
                .andExpect(jsonPath("$.occupation").value("Designer"))
                .andExpect(jsonPath("$.addressLine1").value("7 Palm Residency"))
                .andExpect(jsonPath("$.addressLine2").value("Block C"))
                .andExpect(jsonPath("$.city").value("Pune"))
                .andExpect(jsonPath("$.state").value("Maharashtra"))
                .andExpect(jsonPath("$.postalCode").value("411001"))
                .andExpect(jsonPath("$.country").value("India"))
                .andExpect(jsonPath("$.dateOfBirth").value("1996-04-21"))
                .andExpect(jsonPath("$.kycStatus").value("PENDING"));
    }
}
