package com.unimarket.backend.dto.location;

public record CnpjLocationData(
        String legalName,
        String tradeName,
        String registrationStatus,
        String mainActivity,
        String streetAddress,
        String neighborhood,
        String city,
        String state,
        String zipCode
) {
}
