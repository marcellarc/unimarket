package com.unimarket.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unimarket.backend.dto.CosmosLookupResponseDTO;
import com.unimarket.backend.dto.CosmosProductDTO;

@Service
public class CosmosService {

    @Autowired
    private ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${cosmos.api.url}")
    private String cosmosUrl;

    @Value("${cosmos.api.token}")
    private String cosmosToken;

    @Value("${cosmos.api.user-agent}")
    private String cosmosUserAgent;

    public CosmosProductDTO findByBarCode(String barCode) {
        if (!hasText(barCode)) {
            return null;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(cosmosUrl + "/gtins/" + barCode + ".json"))
                    .header("X-Cosmos-Token", cosmosToken)
                    .header("User-Agent", cosmosUserAgent)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 404 || response.statusCode() >= 400) {
                return null;
            }

            byte[] body = response.body();
            if (body == null || body.length == 0) {
                return null;
            }

            return objectMapper.readValue(new String(body, StandardCharsets.UTF_8), CosmosProductDTO.class);
        } catch (Exception e) {
            return null;
        }
    }

    public CosmosLookupResponseDTO lookupByBarCode(String barCode) {
        CosmosProductDTO product = findByBarCode(barCode);

        if (product == null) {
            return null;
        }

        CosmosLookupResponseDTO response = new CosmosLookupResponseDTO();
        response.setProductName(product.getDescription());
        response.setBrand(product.getBrand() != null ? product.getBrand().getName() : null);
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getThumbnail());
        response.setBarCode(product.getGtin() != null ? product.getGtin() : barCode);
        response.setAveragePrice(product.getAvgPrice());
        response.setCategoryName(product.getGpc() != null ? product.getGpc().getDescription() : null);
        response.setSource("catalogo");

        return response;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
