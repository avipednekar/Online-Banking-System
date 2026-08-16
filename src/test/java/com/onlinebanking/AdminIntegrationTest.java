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
    void adminCanReviewAndApproveHighValuePendingTransfers() throws Exception {
        MvcResult senderReg = mockMvc.perform(post("/api/auth/register")
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

        Long senderId = objectMapper.readTree(senderReg.getResponse().getContentAsString()).get("data").get("userId").asLong();
        String senderToken = objectMapper.readTree(senderReg.getResponse().getContentAsString()).get("data").get("token").asText();

        MvcResult receiverReg = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "sohan",
                                  "email": "sohan@example.com",
                                  "password": "Password@123",
                                  "fullName": "Sohan Patil",
                                  "phoneNumber": "9998887772",
                                  "gender": "MALE",
                                  "occupation": "Trader",
                                  "addressLine1": "45 Lake View",
                                  "addressLine2": "Wing B",
                                  "city": "Pune",
                                  "state": "Maharashtra",
                                  "postalCode": "411001",
                                  "country": "India",
                                  "dateOfBirth": "1993-05-20"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long receiverId = objectMapper.readTree(receiverReg.getResponse().getContentAsString()).get("data").get("userId").asLong();
        String receiverToken = objectMapper.readTree(receiverReg.getResponse().getContentAsString()).get("data").get("token").asText();

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

        String adminToken = objectMapper.readTree(adminLogin.getResponse().getContentAsString()).get("data").get("token").asText();

        // Verify KYC for both
        mockMvc.perform(patch("/api/admin/customers/{userId}/kyc", senderId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kycStatus\":\"VERIFIED\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/admin/customers/{userId}/kyc", receiverId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kycStatus\":\"VERIFIED\"}"))
                .andExpect(status().isOk());

        // Create accounts
        MvcResult senderAccResult = mockMvc.perform(post("/api/accounts")
                        .header("Authorization", "Bearer " + senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accountType\":\"SAVINGS\",\"openingBalance\":100000.00}"))
                .andExpect(status().isCreated())
                .andReturn();
        String senderAccountId = objectMapper.readTree(senderAccResult.getResponse().getContentAsString()).get("data").get("accountId").asText();

        MvcResult receiverAccResult = mockMvc.perform(post("/api/accounts")
                        .header("Authorization", "Bearer " + receiverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accountType\":\"SAVINGS\",\"openingBalance\":5000.00}"))
                .andExpect(status().isCreated())
                .andReturn();
        String receiverAccountNumber = objectMapper.readTree(receiverAccResult.getResponse().getContentAsString()).get("data").get("accountNumber").asText();

        // Add Beneficiary
        MvcResult benResult = mockMvc.perform(post("/api/beneficiaries")
                        .header("Authorization", "Bearer " + senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("{\"nickname\":\"Sohan\",\"bankName\":\"Internal Bank\",\"accountNumber\":\"%s\"}", receiverAccountNumber)))
                .andExpect(status().isCreated())
                .andReturn();
        String beneficiaryId = objectMapper.readTree(benResult.getResponse().getContentAsString()).get("data").get("beneficiaryId").asText();

        // Initiate high value transfer >= 50,000
        MvcResult transferResult = mockMvc.perform(post("/api/transfers")
                        .header("Authorization", "Bearer " + senderToken)
                        .header("Idempotency-Key", "test-admin-trf-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {
                                  "fromAccountId": "%s",
                                  "beneficiaryId": "%s",
                                  "amount": 60000.00,
                                  "currency": "INR",
                                  "remarks": "High value business deal",
                                  "channel": "ONLINE_BANKING"
                                }
                                """, senderAccountId, beneficiaryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"))
                .andReturn();

        String transferId = objectMapper.readTree(transferResult.getResponse().getContentAsString()).get("data").get("transferId").asText();

        // Admin checks overview metrics
        mockMvc.perform(get("/api/admin/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pendingTransfers").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        // Admin checks pending transfers queue
        mockMvc.perform(get("/api/admin/transfers/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].transferId").value(transferId))
                .andExpect(jsonPath("$.data.content[0].amount").value(60000.00))
                .andExpect(jsonPath("$.data.content[0].status").value("PENDING_APPROVAL"));

        // Admin approves transfer
        mockMvc.perform(patch("/api/admin/transfers/{transferId}/approve", transferId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("POSTED"));
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
