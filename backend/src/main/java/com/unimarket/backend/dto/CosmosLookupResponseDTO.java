package com.unimarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CosmosLookupResponseDTO {

    private String productName;
    private String brand;
    private String description;
    private String imageUrl;
    private String barCode;
    private Double averagePrice;
    private String categoryName;
    private String source;
}
