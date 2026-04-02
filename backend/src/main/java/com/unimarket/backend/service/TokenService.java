package com.unimarket.backend.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.entity.Cliente;

@Service
public class TokenService {

    // Puxa a senha secreta que colocamos no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(Market market) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("unimarket-api") // Quem emitiu
                    .withSubject(market.getEmail()) // De quem é o token
                    .withClaim("id", market.getId()) // Guardamos o ID dentro do token para facilitar!
                    .withExpiresAt(genExpirationDate()) // Validade
                    .sign(algorithm); // Assinatura digital
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String generateToken(Cliente cliente) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("unimarket-api")
                    .withSubject(cliente.getDsEmail())
                    .withClaim("id", cliente.getCdCliente())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }


 // 🌟 NOVO MÉTODO: Lê o token e devolve o email do mercado se for válido
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("unimarket-api")
                    .build()
                    .verify(token)
                    .getSubject(); // Pega o email que guardamos lá no generateToken
        } catch (JWTVerificationException exception) {
            return ""; // Se o token for falso, expirado ou inválido, retorna vazio
        }
    }

    public String generateRefreshToken(Market market) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("unimarket-api")
                    .withSubject(market.getEmail())
                    .withExpiresAt(genRefreshTokenExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar refresh token", exception);
        }
    }

    public String generateRefreshToken(Cliente cliente) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("unimarket-api")
                    .withSubject(cliente.getDsEmail())
                    .withExpiresAt(genRefreshTokenExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar refresh token", exception);
        }
    }


    private Instant genRefreshTokenExpirationDate() {
        return LocalDateTime.now().plusDays(7).toInstant(ZoneOffset.of("-03:00"));
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}