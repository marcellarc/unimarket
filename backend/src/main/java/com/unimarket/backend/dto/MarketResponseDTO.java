package com.unimarket.backend.dto;

import java.time.LocalDateTime;

public record MarketResponseDTO(
        Long id,
        String name,
        String officialName,
        String tradeName,
        String registrationStatus,
        String mainActivity,
        String cnpj,
        String email,
        String streetAddress,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        Double latitude,
        Double longitude,
        Double distanceKm,
        Boolean hasCoordinates,
        String addressSource,
        String googleMapsUrl,
        String directionsUrl,
        LocalDateTime createdAt
) {
}
