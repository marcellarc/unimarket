package com.unimarket.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.unimarket.backend.dto.location.CnpjLocationData;

@Service
public class BrasilApiCnpjService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://brasilapi.com.br/api/cnpj/v1")
            .build();

    public Optional<CnpjLocationData> findLocationByCnpj(String cnpj) {
        String sanitizedCnpj = onlyDigits(cnpj);

        if (sanitizedCnpj.length() != 14) {
            return Optional.empty();
        }

        try {
            BrasilApiCnpjResponse response = restClient
                    .get()
                    .uri("/{cnpj}", sanitizedCnpj)
                    .retrieve()
                    .body(BrasilApiCnpjResponse.class);

            if (response == null) {
                return Optional.empty();
            }

            return Optional.of(new CnpjLocationData(
                    response.legalName(),
                    response.tradeName(),
                    response.registrationStatus(),
                    response.mainActivity(),
                    joinAddress(response.streetType(), response.street(), response.number()),
                    response.neighborhood(),
                    response.city(),
                    response.state(),
                    response.zipCode()
            ));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String joinAddress(String streetType, String street, String number) {
        if (!hasText(street)) {
            return null;
        }

        String streetName = hasText(streetType)
                ? streetType.trim() + " " + street.trim()
                : street.trim();

        if (!hasText(number)) {
            return streetName;
        }

        return streetName + ", " + number.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record BrasilApiCnpjResponse(
            @JsonProperty("razao_social") String legalName,
            @JsonProperty("nome_fantasia") String tradeName,
            @JsonProperty("descricao_situacao_cadastral") String registrationStatus,
            @JsonProperty("cnae_fiscal_descricao") String mainActivity,
            @JsonProperty("descricao_tipo_logradouro") String streetType,
            @JsonProperty("logradouro") String street,
            @JsonProperty("numero") String number,
            @JsonProperty("bairro") String neighborhood,
            @JsonProperty("municipio") String city,
            @JsonProperty("uf") String state,
            @JsonProperty("cep") String zipCode
    ) {
    }
}
