package com.unimarket.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class MarketProfileUpdateDTO {

    @Size(min = 2, message = "O nome deve ter pelo menos 2 caracteres")
    private String name;

    @Email(message = "Email invalido")
    private String email;

    private String streetAddress;

    private String neighborhood;

    private String city;

    @Size(min = 2, max = 2, message = "UF deve ter 2 letras")
    private String state;

    private String zipCode;

    private Double latitude;

    private Double longitude;

    private String currentPassword;

    @Size(min = 8, max = 100, message = "A senha deve ter entre 8 e 100 caracteres")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d])[A-Za-z\\d\\W]+$",
            message = "A senha deve conter letras maiusculas, minusculas, numero e caractere especial"
    )
    private String password;

    private Boolean priceAlertsEnabled;

    private Boolean reviewAlertsEnabled;

    private Boolean weeklyReportEnabled;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getPriceAlertsEnabled() {
        return priceAlertsEnabled;
    }

    public void setPriceAlertsEnabled(Boolean priceAlertsEnabled) {
        this.priceAlertsEnabled = priceAlertsEnabled;
    }

    public Boolean getReviewAlertsEnabled() {
        return reviewAlertsEnabled;
    }

    public void setReviewAlertsEnabled(Boolean reviewAlertsEnabled) {
        this.reviewAlertsEnabled = reviewAlertsEnabled;
    }

    public Boolean getWeeklyReportEnabled() {
        return weeklyReportEnabled;
    }

    public void setWeeklyReportEnabled(Boolean weeklyReportEnabled) {
        this.weeklyReportEnabled = weeklyReportEnabled;
    }
}
