package com.unimarket.backend.security;

import java.util.Date;
import javax.crypto.SecretKey;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtService {

//Responsavel por gerar o toke
//o token expira em 24 horas

    private final SecretKey key = Keys.hmacShaKeyFor(
            "unimarket-secret-key-unimarket-secret-key".getBytes());

    public String generateToken(String email) {

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }
}