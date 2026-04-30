package com.unimarket.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.unimarket.backend.entity.PriceAlert;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {

    List<PriceAlert> findByClientIdOrderByCreatedAtDesc(Long clientId);

    Optional<PriceAlert> findByClientIdAndMarketProductIdAndActiveTrue(Long clientId, Long marketProductId);

    @Query("""
            select alert
            from PriceAlert alert
            join fetch alert.client
            join fetch alert.marketProduct marketProduct
            join fetch marketProduct.product
            join fetch marketProduct.market
            where alert.active = true
              and marketProduct.id = :marketProductId
              and marketProduct.price is not null
              and marketProduct.price <= alert.desiredPrice
              and (marketProduct.stockQuantity is null or marketProduct.stockQuantity > 0)
            """)
    List<PriceAlert> findTriggeredAlerts(@Param("marketProductId") Long marketProductId);
}
