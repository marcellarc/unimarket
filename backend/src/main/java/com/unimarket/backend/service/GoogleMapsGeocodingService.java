package com.unimarket.backend.service;

import java.util.List;
import java.util.Map;
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

    private final RestClient nominatimClient = RestClient.builder()
            .baseUrl("https://nominatim.openstreetmap.org")
            .defaultHeader("User-Agent", "UniMarket/1.0")
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

    public Optional<ReverseGeocodingResult> reverseGeocode(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return Optional.empty();
        }

        Optional<ReverseGeocodingResult> googleResult = reverseGeocodeWithGoogle(latitude, longitude);
        if (googleResult.isPresent()) {
            return googleResult;
        }

        return reverseGeocodeWithNominatim(latitude, longitude);
    }

    private Optional<ReverseGeocodingResult> reverseGeocodeWithGoogle(Double latitude, Double longitude) {
        if (!hasText(apiKey)) {
            return Optional.empty();
        }

        try {
            GoogleGeocodingResponse response = restClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/json")
                    .queryParam("latlng", latitude + "," + longitude)
                    .queryParam("language", "pt-BR")
                    .queryParam("region", "br")
                    .queryParam("key", apiKey)
                    .build())
                    .retrieve()
                    .body(GoogleGeocodingResponse.class);

            if (response == null || !"OK".equals(response.status()) || response.results() == null || response.results().isEmpty()) {
                return Optional.empty();
            }

            return response.results()
                    .stream()
                    .sorted((first, second) -> Integer.compare(reverseScore(second), reverseScore(first)))
                    .map(this::toReverseResult)
                    .filter(result -> hasText(result.city()) && hasText(result.state()))
                    .findFirst()
                    .or(() -> Optional.of(toReverseResult(response.results().getFirst())));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    private Optional<ReverseGeocodingResult> reverseGeocodeWithNominatim(Double latitude, Double longitude) {
        try {
            NominatimReverseResponse response = nominatimClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/reverse")
                    .queryParam("format", "jsonv2")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("zoom", 18)
                    .queryParam("addressdetails", 1)
                    .queryParam("accept-language", "pt-BR")
                    .build())
                    .retrieve()
                    .body(NominatimReverseResponse.class);

            if (response == null || response.address() == null) {
                return Optional.empty();
            }

            Map<String, String> address = response.address();
            String city = firstText(address, "city", "town", "municipality", "county", "city_district");
            String state = toBrazilianStateCode(firstText(address, "state", "region"));

            if (!hasText(city) || !hasText(state)) {
                return Optional.empty();
            }

            String streetAddress = String.join(", ",
                    List.of(
                            safeText(firstText(address, "road", "pedestrian", "residential")),
                            safeText(firstText(address, "house_number"))
                    ).stream().filter(this::hasText).toList()
            );
            String neighborhood = firstText(address, "suburb", "neighbourhood", "quarter", "city_district");
            String zipCode = firstText(address, "postcode");

            return Optional.of(new ReverseGeocodingResult(streetAddress, neighborhood, city, state, zipCode));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    private ReverseGeocodingResult toReverseResult(GeocodingResult result) {
        String route = componentLongName(result, "route");
        String streetNumber = componentLongName(result, "street_number");
        String streetAddress = String.join(", ",
                List.of(safeText(route), safeText(streetNumber))
                        .stream()
                        .filter(this::hasText)
                        .toList()
        );
        String neighborhood = firstComponentLongName(result, "sublocality_level_1", "sublocality", "neighborhood");
        String city = firstComponentLongName(result, "administrative_area_level_2", "locality", "administrative_area_level_3");
        String state = componentShortName(result, "administrative_area_level_1");
        String zipCode = componentLongName(result, "postal_code");

        return new ReverseGeocodingResult(streetAddress, neighborhood, city, state, zipCode);
    }

    private int reverseScore(GeocodingResult result) {
        int score = 0;

        if (hasType(result, "street_address")) {
            score += 100;
        }

        if (hasType(result, "premise")) {
            score += 80;
        }

        if (hasType(result, "route")) {
            score += 60;
        }

        if (hasType(result, "postal_code")) {
            score += 30;
        }

        if ("ROOFTOP".equals(result.geometry().location_type())) {
            score += 25;
        }

        if (hasText(componentLongName(result, "street_number"))) {
            score += 15;
        }

        if (hasText(firstComponentLongName(result, "administrative_area_level_2", "locality", "administrative_area_level_3"))) {
            score += 10;
        }

        return score;
    }

    private boolean hasType(GeocodingResult result, String type) {
        return result.types() != null && result.types().contains(type);
    }

    private String firstComponentLongName(GeocodingResult result, String... types) {
        for (String type : types) {
            String value = componentLongName(result, type);
            if (hasText(value)) {
                return value;
            }
        }

        return null;
    }

    private String componentLongName(GeocodingResult result, String type) {
        return component(result, type)
                .map(AddressComponent::long_name)
                .orElse(null);
    }

    private String componentShortName(GeocodingResult result, String type) {
        return component(result, type)
                .map(AddressComponent::short_name)
                .orElse(null);
    }

    private Optional<AddressComponent> component(GeocodingResult result, String type) {
        if (result.address_components() == null) {
            return Optional.empty();
        }

        return result.address_components()
                .stream()
                .filter(component -> component.types() != null && component.types().contains(type))
                .findFirst();
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String firstText(Map<String, String> values, String... keys) {
        for (String key : keys) {
            String value = values.get(key);
            if (hasText(value)) {
                return value;
            }
        }

        return null;
    }

    private String toBrazilianStateCode(String value) {
        if (!hasText(value)) {
            return null;
        }

        String normalizedValue = normalize(value);
        Map<String, String> states = Map.ofEntries(
                Map.entry("acre", "AC"),
                Map.entry("alagoas", "AL"),
                Map.entry("amapa", "AP"),
                Map.entry("amazonas", "AM"),
                Map.entry("bahia", "BA"),
                Map.entry("ceara", "CE"),
                Map.entry("distrito federal", "DF"),
                Map.entry("espirito santo", "ES"),
                Map.entry("goias", "GO"),
                Map.entry("maranhao", "MA"),
                Map.entry("mato grosso", "MT"),
                Map.entry("mato grosso do sul", "MS"),
                Map.entry("minas gerais", "MG"),
                Map.entry("para", "PA"),
                Map.entry("paraiba", "PB"),
                Map.entry("parana", "PR"),
                Map.entry("pernambuco", "PE"),
                Map.entry("piaui", "PI"),
                Map.entry("rio de janeiro", "RJ"),
                Map.entry("rio grande do norte", "RN"),
                Map.entry("rio grande do sul", "RS"),
                Map.entry("rondonia", "RO"),
                Map.entry("roraima", "RR"),
                Map.entry("santa catarina", "SC"),
                Map.entry("sao paulo", "SP"),
                Map.entry("sergipe", "SE"),
                Map.entry("tocantins", "TO")
        );

        return states.getOrDefault(normalizedValue, value.trim().toUpperCase());
    }

    private String normalize(String value) {
        return java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record GoogleGeocodingResponse(String status, List<GeocodingResult> results) {
    }

    public record ReverseGeocodingResult(String streetAddress, String neighborhood, String city, String state, String zipCode) {
    }

    private record GeocodingResult(Geometry geometry, List<AddressComponent> address_components, List<String> types) {
    }

    private record Geometry(Location location, String location_type) {
    }

    private record Location(Double lat, Double lng) {
    }

    private record AddressComponent(String long_name, String short_name, List<String> types) {
    }

    private record NominatimReverseResponse(Map<String, String> address) {
    }
}
