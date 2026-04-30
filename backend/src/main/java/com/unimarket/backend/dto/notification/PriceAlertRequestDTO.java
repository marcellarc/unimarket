package com.unimarket.backend.dto.notification;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PriceAlertRequestDTO {

    @NotNull
    private Long marketProductId;

    @NotNull
    @Positive
    private Double desiredPrice;
}
