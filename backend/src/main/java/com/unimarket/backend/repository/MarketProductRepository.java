package com.unimarket.backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.unimarket.backend.entity.MarketProduct;

public interface MarketProductRepository extends JpaRepository<MarketProduct, Long> {

    List<MarketProduct> findByMarketId(Long id);

    List<MarketProduct> findByProductId(Long id);

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

    @Override
    @EntityGraph(attributePaths = {"market", "product"})
    Page<MarketProduct> findAll(Pageable pageable);

    // busca market_products pelo nome do produto
    @EntityGraph(attributePaths = {"market", "product"})
    Page<MarketProduct> findByProduct_NameContainingIgnoreCase(
            String name,
            Pageable pageable
    );

    // busca produtos por nome e faixa de preço
    @EntityGraph(attributePaths = {"market", "product"})
    Page<MarketProduct>
            findByProduct_NameContainingIgnoreCaseAndPriceBetween(
                    String name,
                    BigDecimal minPrice,
                    BigDecimal maxPrice,
                    Pageable pageable
            );
}
