package com.unimarket.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.unimarket.backend.dto.CosmosProductDTO;

// classe responsável por consultar a API Cosmos pelo código de barras
@Service
public class CosmosService {

    @Autowired
    private RestTemplate restTemplate;

    // URL base da API Cosmos — vem do application.properties
    @Value("${cosmos.api.url}")
    private String cosmosUrl;

    // token de autenticação — vem do application.properties
    @Value("${cosmos.api.token}")
    private String cosmosToken;

    // user agent exigido pela API Cosmos — vem do application.properties
    @Value("${cosmos.api.user-agent}")
    private String cosmosUserAgent;

    // consulta a API Cosmos pelo código de barras e retorna os dados do produto
    public CosmosProductDTO findByBarCode(String barCode) {

        // monta os headers com o token e user agent exigidos pela Cosmos
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Cosmos-Token", cosmosToken);
        headers.set("User-Agent", cosmosUserAgent);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            // faz a requisição GET para a API Cosmos
            ResponseEntity<CosmosProductDTO> response = restTemplate.exchange(
                    cosmosUrl + "/gtins/" + barCode + ".json",
                    HttpMethod.GET,
                    entity,
                    CosmosProductDTO.class
            );

            // retorna os dados do produto encontrado
            return response.getBody();

        } catch (HttpClientErrorException.NotFound e) {
            // produto não encontrado na Cosmos — retorna null para tratamento no service
            return null;
        } catch (Exception e) {
            // Cosmos indisponível — retorna null para fallback no service
            return null;
        }
    }
}
