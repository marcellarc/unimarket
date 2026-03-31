package com.unimarket.backend.dto.password;
import jakarta.validation.constraints.NotBlank;

public record PasswordVerifyCodeDTO(
    @NotBlank String email,
    @NotBlank String code
) {}