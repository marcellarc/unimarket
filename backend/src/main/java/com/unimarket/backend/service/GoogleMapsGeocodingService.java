package com.unimarket.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.unimarket.backend.dto.location.Coordinates;

@Service
public class GoogleMapsGeocodingService {

    @Value("${app.google.maps.api-key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://maps.googleapis.com/maps/api/geocode")
            .build();

    public Optional<Coordinates> geocode(String address) {
        if (!hasText(apiKey) || !hasText(address)) {
            return Optional.empty();
        }

        try {
            GoogleGeocodingResponse response = restClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/json")
                    .queryParam("address", address)
                    .queryParam("key", apiKey)
                    .build())
                    .retrieve()
                    .body(GoogleGeocodingResponse.class);

            if (response == null || !"OK".equals(response.status()) || response.results() == null || response.results().isEmpty()) {
                return Optional.empty();
            }

            Location location = response.results().getFirst().geometry().location();
            return Optional.of(new Coordinates(location.lat(), location.lng()));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record GoogleGeocodingResponse(String status, List<GeocodingResult> results) {
    }

    private record GeocodingResult(Geometry geometry) {
    }

    private record Geometry(Location location) {
    }

    private record Location(Double lat, Double lng) {
    }
}
