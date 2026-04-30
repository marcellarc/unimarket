package com.unimarket.backend.dto.notification;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PriceNotificationResponseDTO {

    private Long id;
    private Long marketProductId;
    private String productName;
    private String marketName;
    private String title;
    private String message;
    private Double targetPrice;
    private Double currentPrice;
    private Boolean read;
    private LocalDateTime createdAt;
}
