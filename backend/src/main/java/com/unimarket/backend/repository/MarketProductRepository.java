package com.unimarket.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.unimarket.backend.entity.MarketProduct;

// Interface responsável por acessar o banco de dados da entidade MercadoProduto
public interface MarketProductRepository extends JpaRepository<MarketProduct, Long> {

    // busca todos os vínculos de um mercado específico
    List<MarketProduct> findByMarketId(Long id);

    // busca todos os mercados que vendem um produto específico
    List<MarketProduct> findByProductId(Long id);

    // verifica se já existe o vínculo entre um mercado e um produto — usado para evitar duplicata
    Optional<MarketProduct> findByMarketIdAndProductId(Long marketId, Long productId);

    @Query(
            value = """
                    SELECT *
                    FROM market_products
                    WHERE market_id = :marketId
                      AND product_id = :productId
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<MarketProduct> findAnyByMarketIdAndProductId(
            @Param("marketId") Long marketId,
            @Param("productId") Long productId
    );
}
