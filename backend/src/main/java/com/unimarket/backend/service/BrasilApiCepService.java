package com.unimarket.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;
import com.unimarket.backend.dto.location.CepLocationResponseDTO;

@Service
public class BrasilApiCepService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://brasilapi.com.br/api/cep")
            .build();

    public Optional<CepLocationResponseDTO> findAddressByCep(String cep) {
        String sanitizedCep = onlyDigits(cep);

        if (sanitizedCep.length() != 8) {
            return Optional.empty();
        }

        Optional<CepLocationResponseDTO> v2Response = fetchAddress(sanitizedCep, "v2");

        if (v2Response.isPresent()) {
            return v2Response;
        }

        return fetchAddress(sanitizedCep, "v1");
    }

    private Optional<CepLocationResponseDTO> fetchAddress(String cep, String version) {
        try {
            BrasilApiCepResponse response = restClient
                    .get()
                    .uri("/{version}/{cep}", version, cep)
                    .retrieve()
                    .body(BrasilApiCepResponse.class);

            if (response == null) {
                return Optional.empty();
            }

            Double latitude = coordinate(response.location(), "latitude");
            Double longitude = coordinate(response.location(), "longitude");
            boolean hasCoordinates = latitude != null && longitude != null;

            return Optional.of(new CepLocationResponseDTO(
                    onlyDigits(response.cep()),
                    response.street(),
                    response.neighborhood(),
                    response.city(),
                    response.state(),
                    latitude,
                    longitude,
                    hasCoordinates,
                    "BRASIL_API_CEP_" + version.toUpperCase(),
                    response.service()
            ));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    private Double coordinate(JsonNode location, String fieldName) {
        if (location == null || location.isNull()) {
            return null;
        }

        JsonNode coordinates = location.path("coordinates");
        JsonNode value = coordinates.path(fieldName);

        if (value.isMissingNode() || value.isNull()) {
            return null;
        }

        if (value.isNumber()) {
            return value.asDouble();
        }

        if (value.isTextual() && hasText(value.asText())) {
            try {
                return Double.valueOf(value.asText());
            } catch (NumberFormatException exception) {
                return null;
            }
        }

        return null;
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record BrasilApiCepResponse(
            String cep,
            String state,
            String city,
            String neighborhood,
            String street,
            String service,
            JsonNode location
    ) {
    }
}
