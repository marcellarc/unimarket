package com.unimarket.backend.dto.notification;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PriceAlertResponseDTO {

    private Long id;
    private Long marketProductId;
    private String productName;
    private String marketName;
    private Double desiredPrice;
    private Double currentPrice;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime notifiedAt;
}
