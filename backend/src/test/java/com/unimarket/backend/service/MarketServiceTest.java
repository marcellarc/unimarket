package com.unimarket.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.unimarket.backend.dto.MarketResponseDTO;
import com.unimarket.backend.dto.location.CepLocationResponseDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.MarketProductRepository;
import com.unimarket.backend.repository.MarketRepository;

@ExtendWith(MockitoExtension.class)
class MarketServiceTest {

    @Mock
    private MarketRepository repository;

    @Mock
    private MarketProductRepository marketProductRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private BrasilApiCnpjService brasilApiCnpjService;

    @Mock
    private GoogleMapsGeocodingService googleMapsGeocodingService;

    @Mock
    private LocationService locationService;

    @InjectMocks
    private MarketService service;

    @Test
    void listNearbyEnrichesMarketCoordinatesFromZipCodeBeforeCalculatingDistance() {
        Market market = new Market();
        market.setId(10L);
        market.setName("Mercado CEP");
        market.setCnpj("12345678000199");
        market.setZipCode("11010000");

        when(repository.findAll()).thenReturn(List.of(market));
        when(brasilApiCnpjService.findLocationByCnpj("12345678000199")).thenReturn(Optional.empty());
        when(locationService.findByCep("11010000")).thenReturn(new CepLocationResponseDTO(
                "11010000",
                "Rua Teste",
                "Centro",
                "Santos",
                "SP",
                -23.9618,
                -46.3322,
                true,
                "BRASIL_API_CEP",
                null
        ));
        when(repository.save(any(Market.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<MarketResponseDTO> results = service.listNearby(-23.9608, -46.3336, "Santos", "SP", 5.0);

        assertEquals(1, results.size());
        assertNotNull(results.get(0).distanceKm());
        assertEquals(-23.9618, results.get(0).latitude());
        assertEquals(-46.3322, results.get(0).longitude());
        verify(locationService).findByCep("11010000");
    }
}
