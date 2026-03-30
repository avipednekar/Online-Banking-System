package com.onlinebanking.model;

import com.onlinebanking.security.crypto.EncryptedStringConverter;
import com.onlinebanking.util.IdentifierGenerator;
import com.onlinebanking.util.NormalizationUtils;
import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_profiles")
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private BankUser user;

    @Column(nullable = false, unique = true, length = 64)
    private String customerId;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, length = 1024)
    private String fullName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, length = 1024)
    private String phoneNumber;

    @Column(nullable = false, length = 64)
    private String phoneNumberHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false)
    private String occupation;

    @OneToOne(optional = false, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "address_id", unique = true)
    private CustomerAddress address;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus kycStatus;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    public CustomerProfile() {
    }

    public CustomerProfile(BankUser user,
                           String fullName,
                           String phoneNumber,
                           Gender gender,
                           String occupation,
                           String addressLine1,
                           String addressLine2,
                           String city,
                           String state,
                           String postalCode,
                           String country,
                           LocalDate dateOfBirth) {
        this.user = user;
        this.customerId = IdentifierGenerator.newId("CIF");
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.phoneNumberHash = NormalizationUtils.hashPhone(phoneNumber);
        this.gender = gender;
        this.occupation = occupation;
        this.address = new CustomerAddress(addressLine1, addressLine2, city, state, postalCode, country);
        this.dateOfBirth = dateOfBirth;
        this.kycStatus = KycStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public BankUser getUser() {
        return user;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.phoneNumberHash = NormalizationUtils.hashPhone(phoneNumber);
        this.updatedAt = LocalDateTime.now();
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
        this.updatedAt = LocalDateTime.now();
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
        this.updatedAt = LocalDateTime.now();
    }

    public String getAddressLine1() {
        return address.getAddressLine1();
    }

    public void setAddressLine1(String addressLine1) {
        this.address.setAddressLine1(addressLine1);
        this.updatedAt = LocalDateTime.now();
    }

    public String getAddressLine2() {
        return address.getAddressLine2();
    }

    public void setAddressLine2(String addressLine2) {
        this.address.setAddressLine2(addressLine2);
        this.updatedAt = LocalDateTime.now();
    }

    public String getCity() {
        return address.getCity();
    }

    public void setCity(String city) {
        this.address.setCity(city);
        this.updatedAt = LocalDateTime.now();
    }

    public String getState() {
        return address.getState();
    }

    public void setState(String state) {
        this.address.setState(state);
        this.updatedAt = LocalDateTime.now();
    }

    public String getPostalCode() {
        return address.getPostalCode();
    }

    public void setPostalCode(String postalCode) {
        this.address.setPostalCode(postalCode);
        this.updatedAt = LocalDateTime.now();
    }

    public String getCountry() {
        return address.getCountry();
    }

    public void setCountry(String country) {
        this.address.setCountry(country);
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
        this.updatedAt = LocalDateTime.now();
    }

    public KycStatus getKycStatus() {
        return kycStatus;
    }

    public void setKycStatus(KycStatus kycStatus) {
        this.kycStatus = kycStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public CustomerAddress getAddress() {
        return address;
    }
}
