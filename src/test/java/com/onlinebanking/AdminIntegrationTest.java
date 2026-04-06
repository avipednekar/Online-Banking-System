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
import static org.junit.jupiter.api.Assertions.assertTrue;

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

        MvcResult customersBeforeUpdate = mockMvc.perform(get("/api/admin/customers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode initialCustomers = extractCustomerCollection(
                objectMapper.readTree(customersBeforeUpdate.getResponse().getContentAsString())
        );
        boolean pendingStatus = false;
        for (JsonNode customer : initialCustomers) {
            JsonNode username = customer.get("username");
            JsonNode kycStatus = customer.get("kycStatus");
            if (username != null && "sara".equals(username.asText())) {
                pendingStatus = kycStatus != null && "PENDING".equals(kycStatus.asText());
                break;
            }
        }
        assertTrue(pendingStatus);

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

        MvcResult customersAfterUpdate = mockMvc.perform(get("/api/admin/customers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode refreshedCustomers = extractCustomerCollection(
                objectMapper.readTree(customersAfterUpdate.getResponse().getContentAsString())
        );
        boolean persistedStatus = false;
        for (JsonNode customer : refreshedCustomers) {
            JsonNode username = customer.get("username");
            JsonNode kycStatus = customer.get("kycStatus");
            if (username != null && "sara".equals(username.asText())) {
                persistedStatus = kycStatus != null && "VERIFIED".equals(kycStatus.asText());
                break;
            }
        }
        assertTrue(persistedStatus);
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

    @Test
    void adminCustomerRegistrySupportsPaginationSearchAndDetail() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "pagetest",
                                  "email": "pagetest@example.com",
                                  "password": "Password@123",
                                  "fullName": "Page Test",
                                  "phoneNumber": "9998887766",
                                  "gender": "OTHER",
                                  "occupation": "Operator",
                                  "addressLine1": "55 Search Road",
                                  "addressLine2": "Unit 8",
                                  "city": "Pune",
                                  "state": "Maharashtra",
                                  "postalCode": "411001",
                                  "country": "India",
                                  "dateOfBirth": "1991-03-12"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long userId = objectMapper.readTree(registration.getResponse().getContentAsString())
                .get("data")
                .get("userId")
                .asLong();

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

        String adminToken = objectMapper.readTree(adminLogin.getResponse().getContentAsString())
                .get("data")
                .get("token")
                .asText();

        mockMvc.perform(get("/api/admin/customers?page=0&size=20&search=pagetest")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.content[0].username").value("pagetest"))
                .andExpect(jsonPath("$.data.content[0].city").value("Pune"));

        mockMvc.perform(get("/api/admin/customers/{userId}", userId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("pagetest"))
                .andExpect(jsonPath("$.data.addressLine1").value("55 Search Road"))
                .andExpect(jsonPath("$.data.occupation").value("Operator"));
    }

    private JsonNode extractCustomerCollection(JsonNode response) {
        JsonNode data = response.get("data");
        if (data != null && data.isArray()) {
            return data;
        }
        if (data != null && data.has("content")) {
            return data.get("content");
        }
        return objectMapper.createArrayNode();
    }
}
