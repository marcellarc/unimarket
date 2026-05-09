package com.unimarket.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.location.CepLocationResponseDTO;
import com.unimarket.backend.dto.location.Coordinates;

@Service
public class LocationService {

    @Autowired
    private BrasilApiCepService brasilApiCepService;

    @Autowired
    private GoogleMapsGeocodingService googleMapsGeocodingService;

    public CepLocationResponseDTO findByCep(String cep) {
        String sanitizedCep = onlyDigits(cep);

        if (sanitizedCep.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP deve conter 8 digitos");
        }

        CepLocationResponseDTO location = brasilApiCepService.findAddressByCep(sanitizedCep)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CEP nao encontrado"));

        if (Boolean.TRUE.equals(location.hasCoordinates())) {
            return location;
        }

        return googleMapsGeocodingService.geocode(buildAddressQuery(location))
                .map(coordinates -> withCoordinates(location, coordinates))
                .orElse(location);
    }

    private CepLocationResponseDTO withCoordinates(CepLocationResponseDTO location, Coordinates coordinates) {
        return new CepLocationResponseDTO(
                location.zipCode(),
                location.streetAddress(),
                location.neighborhood(),
                location.city(),
                location.state(),
                coordinates.latitude(),
                coordinates.longitude(),
                true,
                appendSource(location.source(), "GOOGLE_GEOCODING"),
                location.service()
        );
    }

    private String buildAddressQuery(CepLocationResponseDTO location) {
        return String.join(", ",
                List.of(
                        safeText(location.streetAddress()),
                        safeText(location.neighborhood()),
                        safeText(location.city()),
                        safeText(location.state()),
                        safeText(location.zipCode()),
                        "Brasil"
                ).stream().filter(this::hasText).toList()
        );
    }

    private String appendSource(String currentSource, String newSource) {
        if (!hasText(currentSource)) {
            return newSource;
        }

        if (currentSource.contains(newSource)) {
            return currentSource;
        }

        return currentSource + "," + newSource;
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
