package com.unimarket.backend.dto;

import java.time.LocalDateTime;

public record ClientProfileResponseDTO(
        Long id,
        String name,
        String email,
        String streetAddress,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        Double latitude,
        Double longitude,
        String locationSource,
        String profileImageUrl,
        Double searchRadiusKm,
        Boolean priceAlertsEnabled,
        Boolean weeklySummaryEnabled,
        Boolean browserPushEnabled,
        LocalDateTime createdAt
) {
}
