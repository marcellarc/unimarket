package com.unimarket.backend.service;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GoogleAuthService {

    private static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String GOOGLE_ISSUER = "https://accounts.google.com";
    private static final String GOOGLE_ISSUER_SHORT = "accounts.google.com";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.google.oauth.client-id:}")
    private String googleClientId;

    public GoogleAccount verifyIdToken(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Login com Google nao configurado no servidor");
        }

        try {
            String[] tokenParts = idToken.split("\\.");
            if (tokenParts.length != 3) {
                throw new RuntimeException("Token do Google invalido");
            }

            JsonNode header = readJwtPart(tokenParts[0]);
            JsonNode payload = readJwtPart(tokenParts[1]);
            String keyId = requiredText(header, "kid");
            String algorithm = requiredText(header, "alg");

            if (!"RS256".equals(algorithm)) {
                throw new RuntimeException("Algoritmo do token do Google nao suportado");
            }

            PublicKey publicKey = fetchGooglePublicKey(keyId);
            verifySignature(tokenParts[0] + "." + tokenParts[1], tokenParts[2], publicKey);
            validateClaims(payload);

            return new GoogleAccount(
                    requiredText(payload, "sub"),
                    requiredText(payload, "email").trim().toLowerCase(),
                    textOrNull(payload, "name"),
                    textOrNull(payload, "picture")
            );
        } catch (RuntimeException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new RuntimeException("Nao foi possivel validar o token do Google", exception);
        }
    }

    private JsonNode readJwtPart(String value) throws Exception {
        byte[] decoded = Base64.getUrlDecoder().decode(value);
        return objectMapper.readTree(decoded);
    }

    private PublicKey fetchGooglePublicKey(String keyId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GOOGLE_JWKS_URL))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("Nao foi possivel carregar as chaves publicas do Google");
        }

        JsonNode keys = objectMapper.readTree(response.body()).path("keys");
        for (JsonNode key : keys) {
            if (keyId.equals(key.path("kid").asText())) {
                return buildRsaPublicKey(key);
            }
        }

        throw new RuntimeException("Chave publica do Google nao encontrada");
    }

    private RSAPublicKey buildRsaPublicKey(JsonNode key) throws Exception {
        byte[] modulusBytes = Base64.getUrlDecoder().decode(requiredText(key, "n"));
        byte[] exponentBytes = Base64.getUrlDecoder().decode(requiredText(key, "e"));

        BigInteger modulus = new BigInteger(1, modulusBytes);
        BigInteger exponent = new BigInteger(1, exponentBytes);

        RSAPublicKeySpec keySpec = new RSAPublicKeySpec(modulus, exponent);
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(keySpec);
    }

    private void verifySignature(String signingInput, String encodedSignature, PublicKey publicKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initVerify(publicKey);
        signature.update(signingInput.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        byte[] signatureBytes = Base64.getUrlDecoder().decode(encodedSignature);
        if (!signature.verify(signatureBytes)) {
            throw new RuntimeException("Assinatura do token do Google invalida");
        }
    }

    private void validateClaims(JsonNode payload) {
        String issuer = requiredText(payload, "iss");
        if (!GOOGLE_ISSUER.equals(issuer) && !GOOGLE_ISSUER_SHORT.equals(issuer)) {
            throw new RuntimeException("Emissor do token do Google invalido");
        }

        String audience = requiredText(payload, "aud");
        if (!googleClientId.equals(audience)) {
            throw new RuntimeException("Token do Google emitido para outro aplicativo");
        }

        long expiresAt = payload.path("exp").asLong(0);
        if (expiresAt <= Instant.now().getEpochSecond()) {
            throw new RuntimeException("Token do Google expirado");
        }

        if (!payload.path("email_verified").asBoolean(false)) {
            throw new RuntimeException("E-mail do Google nao verificado");
        }
    }

    private String requiredText(JsonNode node, String fieldName) {
        String value = textOrNull(node, fieldName);
        if (value == null || value.isBlank()) {
            throw new RuntimeException("Token do Google sem o campo " + fieldName);
        }
        return value;
    }

    private String textOrNull(JsonNode node, String fieldName) {
        JsonNode field = node.path(fieldName);
        return field.isMissingNode() || field.isNull() ? null : field.asText();
    }

    public record GoogleAccount(
            String subject,
            String email,
            String name,
            String pictureUrl
    ) {}
}
