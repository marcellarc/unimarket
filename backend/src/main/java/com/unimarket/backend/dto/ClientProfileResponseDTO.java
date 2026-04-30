package com.unimarket.backend.dto;

import java.time.LocalDateTime;

public record ClientProfileResponseDTO(
        Long id,
        String name,
        String email,
        LocalDateTime createdAt
) {
}
