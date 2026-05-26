package com.unimarket.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.MarketDTO;
import com.unimarket.backend.dto.MarketProfileUpdateDTO;
import com.unimarket.backend.dto.MarketResponseDTO;
import com.unimarket.backend.dto.location.CnpjLocationData;
import com.unimarket.backend.dto.location.Coordinates;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.MarketRepository;
import com.unimarket.backend.repository.MarketProductRepository;

import jakarta.transaction.Transactional;

@Service
public class MarketService {

    @Autowired
    private MarketRepository repository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BrasilApiCnpjService brasilApiCnpjService;

    @Autowired
    private GoogleMapsGeocodingService googleMapsGeocodingService;

    // Cadastro publico do supermercado, com normalizacao de CNPJ e enriquecimento inicial.
    public Market register(MarketDTO dto) {
        String sanitizedCnpj = onlyDigits(dto.getCnpj());
        String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);

        if (repository.findByCnpj(sanitizedCnpj).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }

        if (repository.findByEmail(email).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        Market market = modelMapper.map(dto, Market.class);
        market.setCnpj(sanitizedCnpj);
        market.setEmail(email);
        market.setPassword(passwordEncoder.encode(dto.getPassword()));
        // Tenta completar endereço e coordenadas antes de salvar.
        enrichLocation(market);

        return repository.save(market);
    }

    // Perfil usado na aba de configuracoes do mercado.
    public MarketResponseDTO getCurrentProfile(Market authenticatedMarket) {
        Market market = repository.findById(authenticatedMarket.getId())
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        if (needsLocationEnrichment(market)) {
            // Mercados antigos podem não ter cidade, UF ou coordenadas.
            enrichLocation(market);
            market = repository.save(market);
        }

        return toResponse(market, null);
    }

    @Transactional
    public MarketResponseDTO updateCurrentProfile(Market authenticatedMarket, MarketProfileUpdateDTO dto) {
        Market market = repository.findById(authenticatedMarket.getId())
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        if (hasText(dto.getName())) {
            market.setName(dto.getName().trim());
        }

        if (hasText(dto.getEmail())) {
            String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
            repository.findByEmail(email)
                    .filter(existingMarket -> !existingMarket.getId().equals(market.getId()))
                    .ifPresent(existingMarket -> {
                        throw new RuntimeException("E-mail já cadastrado");
                    });
            market.setEmail(email);
        }

        if (dto.getStreetAddress() != null) {
            market.setStreetAddress(emptyToNull(dto.getStreetAddress()));
        }

        if (dto.getNeighborhood() != null) {
            market.setNeighborhood(emptyToNull(dto.getNeighborhood()));
        }

        if (dto.getCity() != null) {
            market.setCity(emptyToNull(dto.getCity()));
        }

        if (dto.getState() != null) {
            market.setState(emptyToNull(dto.getState()) == null ? null : dto.getState().trim().toUpperCase(Locale.ROOT));
        }

        if (dto.getZipCode() != null) {
            // CEP fica sem mascara para evitar divergencia entre fontes externas.
            String zipCode = onlyDigits(dto.getZipCode());
            market.setZipCode(zipCode.isEmpty() ? null : zipCode);
        }

        if (dto.getLatitude() != null) {
            market.setLatitude(dto.getLatitude());
        }

        if (dto.getLongitude() != null) {
            market.setLongitude(dto.getLongitude());
        }

        if (hasText(dto.getPassword())) {
            if (!hasText(dto.getCurrentPassword())) {
                throw new RuntimeException("Informe a senha atual para definir uma nova senha");
            }

            if (!passwordEncoder.matches(dto.getCurrentPassword(), market.getPassword())) {
                throw new RuntimeException("Senha atual invalida");
            }

            market.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getPriceAlertsEnabled() != null) {
            market.setPriceAlertsEnabled(dto.getPriceAlertsEnabled());
        }

        if (dto.getReviewAlertsEnabled() != null) {
            market.setReviewAlertsEnabled(dto.getReviewAlertsEnabled());
        }

        if (dto.getWeeklyReportEnabled() != null) {
            market.setWeeklyReportEnabled(dto.getWeeklyReportEnabled());
        }

        return toResponse(repository.save(market), null);
    }

    @Transactional
    public MarketResponseDTO refreshCurrentProfileFromCnpj(Market authenticatedMarket) {
        Market market = repository.findById(authenticatedMarket.getId())
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // Sincroniza novamente com a BrasilAPI quando o cadastro do CNPJ precisar ser revisto.
        enrichLocation(market);
        return toResponse(repository.save(market), null);
    }

    // Busca principal do sistema: filtra mercados por coordenada ou por cidade/UF.
    public List<MarketResponseDTO> listNearby(Double latitude, Double longitude, String city, String state, Double radiusKm) {
        double maxRadius = radiusKm == null || radiusKm <= 0 ? 10 : radiusKm;
        LocationFilter locationFilter = normalizeLocationFilter(city, state);
        boolean hasUserCoordinates = latitude != null && longitude != null;
        List<Market> markets = repository.findAll();

        markets.stream()
                .filter(this::needsLocationEnrichment)
                .forEach(market -> {
                    // Completa dados ausentes antes de calcular distância.
                    enrichLocation(market);
                    repository.save(market);
                });

        return markets
                .stream()
                .map(market -> toResponse(
                        market,
                        hasUserCoordinates && hasCoordinates(market)
                                ? calculateDistanceKm(latitude, longitude, market.getLatitude(), market.getLongitude())
                                : null
                ))
                .filter(response -> {
                    if (hasUserCoordinates && response.distanceKm() != null) {
                        // Quando ha coordenadas, o raio em km e o criterio mais confiavel.
                        return response.distanceKm() <= maxRadius;
                    }

                    if (hasText(locationFilter.city())) {
                        // Fallback para usuários sem permissão de geolocalização.
                        return equalsNormalized(response.city(), locationFilter.city())
                                && (!hasText(locationFilter.state()) || equalsNormalized(response.state(), locationFilter.state()));
                    }

                    return true;
                })
                .sorted(Comparator
                        .comparing((MarketResponseDTO response) -> response.distanceKm() == null ? Double.MAX_VALUE : response.distanceKm())
                        .thenComparing(response -> safeText(response.name()), String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public void deleteMarket(Long id) {
        // Remove logicamente os vinculos de produto antes do soft delete do mercado.
        Market market = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        marketProductRepository.findByMarketId(id)
                .forEach(marketProductRepository::delete);

        repository.delete(market);
    }

    private boolean needsLocationEnrichment(Market market) {
        return !hasText(market.getCity()) || !hasText(market.getState()) || !hasCoordinates(market);
    }

    private void enrichLocation(Market market) {
        // BrasilAPI fornece dados oficiais do CNPJ; Google Maps completa coordenadas.
        brasilApiCnpjService.findLocationByCnpj(market.getCnpj())
                .ifPresent(location -> applyCnpjLocation(market, location));

        if (!hasCoordinates(market)) {
            Optional<Coordinates> coordinates = googleMapsGeocodingService.geocode(buildAddressQuery(market));
            coordinates.ifPresent(location -> {
                market.setLatitude(location.latitude());
                market.setLongitude(location.longitude());
            });
        }
    }

    private void applyCnpjLocation(Market market, CnpjLocationData location) {
        // Campos vindos do CNPJ ajudam a manter o perfil do mercado confiavel.
        if (hasText(location.legalName())) {
            market.setOfficialName(location.legalName().trim());
        }

        if (hasText(location.tradeName())) {
            market.setTradeName(location.tradeName().trim());
        }

        if (hasText(location.registrationStatus())) {
            market.setRegistrationStatus(location.registrationStatus().trim());
        }

        if (hasText(location.mainActivity())) {
            market.setMainActivity(location.mainActivity().trim());
        }

        if (isBlankOrPending(market.getStreetAddress()) && hasText(location.streetAddress())) {
            market.setStreetAddress(location.streetAddress());
        }

        if (isBlankOrPending(market.getNeighborhood()) && hasText(location.neighborhood())) {
            market.setNeighborhood(location.neighborhood());
        }

        if (!hasText(market.getCity()) && hasText(location.city())) {
            market.setCity(location.city());
        }

        if (!hasText(market.getState()) && hasText(location.state())) {
            market.setState(location.state());
        }

        if (!hasText(market.getZipCode()) && hasText(location.zipCode())) {
            market.setZipCode(onlyDigits(location.zipCode()));
        }
    }

    private MarketResponseDTO toResponse(Market market, Double distanceKm) {
        return new MarketResponseDTO(
                market.getId(),
                marketDisplayName(market),
                market.getOfficialName(),
                market.getTradeName(),
                market.getRegistrationStatus(),
                market.getMainActivity(),
                market.getCnpj(),
                market.getEmail(),
                market.getStreetAddress(),
                market.getNeighborhood(),
                market.getCity(),
                market.getState(),
                market.getZipCode(),
                market.getLatitude(),
                market.getLongitude(),
                distanceKm == null ? null : Math.round(distanceKm * 10.0) / 10.0,
                hasCoordinates(market),
                null,
                buildGoogleMapsUrl(market),
                buildDirectionsUrl(market),
                valueOrDefault(market.getPriceAlertsEnabled(), true),
                valueOrDefault(market.getReviewAlertsEnabled(), true),
                valueOrDefault(market.getWeeklyReportEnabled(), true),
                market.getCreatedAt()
        );
    }

    private Boolean valueOrDefault(Boolean value, Boolean fallback) {
        return value == null ? fallback : value;
    }

    private String buildGoogleMapsUrl(Market market) {
        return "https://www.google.com/maps/search/?api=1&query=" + encode(buildAddressQuery(market));
    }

    private String buildDirectionsUrl(Market market) {
        return "https://www.google.com/maps/dir/?api=1&destination=" + encode(buildAddressQuery(market));
    }

    private String buildAddressQuery(Market market) {
        if (hasCoordinates(market)) {
            return market.getLatitude() + "," + market.getLongitude();
        }

        return String.join(", ",
                List.of(
                        marketDisplayName(market),
                        safeText(market.getStreetAddress()),
                        safeText(market.getNeighborhood()),
                        safeText(market.getCity()),
                        safeText(market.getState()),
                        safeText(market.getZipCode())
                ).stream().filter(this::hasText).toList()
        );
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        // Fórmula de Haversine: calcula distância aproximada entre duas coordenadas.
        final int earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double originLat = Math.toRadians(lat1);
        double destinationLat = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(originLat) * Math.cos(destinationLat)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private LocationFilter normalizeLocationFilter(String city, String state) {
        if (hasText(city) && city.contains(",") && !hasText(state)) {
            String[] parts = city.split(",", 2);
            return new LocationFilter(parts[0].trim(), parts[1].trim());
        }

        return new LocationFilter(city, state);
    }

    private boolean hasCoordinates(Market market) {
        return market.getLatitude() != null && market.getLongitude() != null;
    }

    private boolean equalsNormalized(String first, String second) {
        return normalize(first).equals(normalize(second));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String marketDisplayName(Market market) {
        if (hasText(market.getTradeName())) {
            return market.getTradeName().trim();
        }

        if (hasText(market.getName())) {
            return market.getName().trim();
        }

        if (hasText(market.getOfficialName())) {
            return market.getOfficialName().trim();
        }

        return "Supermercado";
    }

    private String emptyToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isBlankOrPending(String value) {
        // Alguns CNPJs retornam endereço pendente; nesse caso aceitamos sobrescrever.
        return !hasText(value) || normalize(value).contains("pendente");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record LocationFilter(String city, String state) {
    }
}
