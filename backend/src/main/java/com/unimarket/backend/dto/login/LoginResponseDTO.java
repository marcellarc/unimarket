package com.unimarket.backend.dto.login;

public record LoginResponseDTO(
    Long id,
    String name,
    String email,
    String accessToken,  // O de 2 horas
    String refreshToken  // O de 7 dias
) {}