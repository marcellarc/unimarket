package com.unimarket.backend.dto.location;

public record CepLocationResponseDTO(
        String zipCode,
        String streetAddress,
        String neighborhood,
        String city,
        String state,
        Double latitude,
        Double longitude,
        Boolean hasCoordinates,
        String source,
        String service
) {
}
