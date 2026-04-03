package com.onlinebanking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    private static final String REFRESH_COOKIE_NAME = "bank_refresh_token";

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
    void registerReturnsAccessTokenAndSetsRefreshCookie() throws Exception {
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
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString(REFRESH_COOKIE_NAME + "=")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.sessionId").isString())
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    @Test
    void refreshRotatesSessionCookieAndRevokesPriorAccessToken() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "noor",
                                  "email": "noor@example.com",
                                  "password": "Password@123",
                                  "fullName": "Noor Ali",
                                  "phoneNumber": "9876543211",
                                  "gender": "FEMALE",
                                  "occupation": "Manager",
                                  "addressLine1": "10 Market Road",
                                  "addressLine2": "Suite 3",
                                  "city": "Mumbai",
                                  "state": "Maharashtra",
                                  "postalCode": "400001",
                                  "country": "India",
                                  "dateOfBirth": "1995-08-10"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode authResponse = objectMapper.readTree(registration.getResponse().getContentAsString());
        String accessToken = authResponse.get("data").get("token").asText();
        String sessionId = authResponse.get("data").get("sessionId").asText();
        Cookie refreshCookie = extractRefreshCookie(registration);

        MvcResult refresh = mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString(REFRESH_COOKIE_NAME + "=")))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.sessionId").value(sessionId))
                .andReturn();

        JsonNode refreshedAuthResponse = objectMapper.readTree(refresh.getResponse().getContentAsString());
        String rotatedAccessToken = refreshedAuthResponse.get("data").get("token").asText();
        String rotatedCookieHeader = refresh.getResponse().getHeader(HttpHeaders.SET_COOKIE);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + rotatedAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("noor"));

        assertNotNull(rotatedCookieHeader);
        org.junit.jupiter.api.Assertions.assertTrue(!rotatedCookieHeader.contains(refreshCookie.getValue()));
    }

    @Test
    void logoutRevokesCurrentAccessTokenImmediately() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "liam",
                                  "email": "liam@example.com",
                                  "password": "Password@123",
                                  "fullName": "Liam Harper",
                                  "phoneNumber": "9876543212",
                                  "gender": "MALE",
                                  "occupation": "Auditor",
                                  "addressLine1": "45 River Lane",
                                  "addressLine2": "Tower 2",
                                  "city": "Pune",
                                  "state": "Maharashtra",
                                  "postalCode": "411001",
                                  "country": "India",
                                  "dateOfBirth": "1994-03-15"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode authResponse = objectMapper.readTree(registration.getResponse().getContentAsString());
        String accessToken = authResponse.get("data").get("token").asText();
        Cookie refreshCookie = extractRefreshCookie(registration);

        mockMvc.perform(post("/api/auth/logout").cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());
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

    @Test
    void registerRejectsNonIndiaCountry() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "oliver",
                                  "email": "oliver@example.com",
                                  "password": "Password@123",
                                  "fullName": "Oliver Stone",
                                  "phoneNumber": "9876543222",
                                  "gender": "MALE",
                                  "occupation": "Consultant",
                                  "addressLine1": "1 Finance Avenue",
                                  "addressLine2": "Tower A",
                                  "city": "Dubai",
                                  "state": "Dubai",
                                  "postalCode": "000001",
                                  "country": "United Arab Emirates",
                                  "dateOfBirth": "1993-05-20"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.fields.country").value("Country must be India"));
    }

    private Cookie extractRefreshCookie(MvcResult result) {
        String setCookieHeader = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookieHeader);

        String cookiePair = setCookieHeader.split(";", 2)[0];
        String cookieValue = cookiePair.substring((REFRESH_COOKIE_NAME + "=").length());

        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, cookieValue);
        cookie.setHttpOnly(true);
        return cookie;
    }
}
