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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void adminCanReviewCustomersAndUpdateKyc() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "sara",
                                  "email": "sara@example.com",
                                  "password": "Password@123",
                                  "fullName": "Sara Khan",
                                  "phoneNumber": "9876543210",
                                  "gender": "FEMALE",
                                  "occupation": "Architect",
                                  "addressLine1": "18 River Road",
                                  "addressLine2": "Suite 9",
                                  "city": "Mumbai",
                                  "state": "Maharashtra",
                                  "postalCode": "400001",
                                  "country": "India",
                                  "dateOfBirth": "1994-07-11"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode userResponse = objectMapper.readTree(registration.getResponse().getContentAsString());
        Long userId = userResponse.get("data").get("userId").asLong();

        MvcResult adminLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "Admin@123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andReturn();

        JsonNode adminResponse = objectMapper.readTree(adminLogin.getResponse().getContentAsString());
        String adminToken = adminResponse.get("data").get("token").asText();

        mockMvc.perform(get("/api/admin/customers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].username").value("sara"))
                .andExpect(jsonPath("$.data[0].kycStatus").value("PENDING"));

        mockMvc.perform(patch("/api/admin/customers/{userId}/kyc", userId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "kycStatus": "VERIFIED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("sara"))
                .andExpect(jsonPath("$.data.kycStatus").value("VERIFIED"));
    }

    @Test
    void verifiedCustomerAccountRequestRequiresAdminApproval() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "rohan",
                                  "email": "rohan@example.com",
                                  "password": "Password@123",
                                  "fullName": "Rohan Patil",
                                  "phoneNumber": "9998887771",
                                  "gender": "MALE",
                                  "occupation": "Analyst",
                                  "addressLine1": "44 Lake View",
                                  "addressLine2": "Wing A",
                                  "city": "Pune",
                                  "state": "Maharashtra",
                                  "postalCode": "411001",
                                  "country": "India",
                                  "dateOfBirth": "1995-02-18"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode userResponse = objectMapper.readTree(registration.getResponse().getContentAsString());
        Long userId = userResponse.get("data").get("userId").asLong();
        String userToken = userResponse.get("data").get("token").asText();

        MvcResult adminLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "Admin@123"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode adminResponse = objectMapper.readTree(adminLogin.getResponse().getContentAsString());
        String adminToken = adminResponse.get("data").get("token").asText();

        mockMvc.perform(post("/api/accounts")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountType": "SAVINGS",
                                  "openingBalance": 1000.00
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("KYC must be verified before submitting an account opening request"));

        mockMvc.perform(patch("/api/admin/customers/{userId}/kyc", userId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "kycStatus": "VERIFIED"
                                }
                                """))
                .andExpect(status().isOk());

        MvcResult requestResult = mockMvc.perform(post("/api/accounts")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "accountType": "SAVINGS",
                                  "openingBalance": 1000.00
                                }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.approvedAccountNumber").doesNotExist())
                .andReturn();

        JsonNode requestResponse = objectMapper.readTree(requestResult.getResponse().getContentAsString());
        long requestId = requestResponse.get("data").get("id").asLong();

        mockMvc.perform(get("/api/accounts")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));

        mockMvc.perform(get("/api/admin/account-requests")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].requesterUsername").value("rohan"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));

        mockMvc.perform(patch("/api/admin/account-requests/{requestId}/approve", requestId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.approvedAccountNumber").value(org.hamcrest.Matchers.matchesPattern("9\\d{9}")));

        mockMvc.perform(get("/api/accounts")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].accountNumber").value(org.hamcrest.Matchers.matchesPattern("9\\d{9}")));
    }
}
