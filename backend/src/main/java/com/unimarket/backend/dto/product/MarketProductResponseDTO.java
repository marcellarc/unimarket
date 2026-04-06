package com.unimarket.backend.dto.product;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após atualizar preço e estoque de um produto
@Getter
@Setter
public class MarketProductResponseDTO {

    // ID do vínculo entre mercado e produto
    private Long id;

    // nome do mercado
    private String marketName;

    // nome do produto
    private String productName;

    // marca do produto
    private String brand;

    // preço praticado pelo mercado
    private Double price;

    // quantidade em estoque
    private Integer stockQuantity;

    // data da última atualização de preço ou estoque
    private LocalDateTime updatedAt;
}
