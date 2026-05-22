package com.unimarket.backend.dto.login;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequestDTO(
        @NotBlank(message = "O token do Google e obrigatorio")
        String idToken
) {}
