package com.unimarket.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.unimarket.backend.entity.PriceNotification;

public interface PriceNotificationRepository extends JpaRepository<PriceNotification, Long> {

    List<PriceNotification> findByClientIdOrderByCreatedAtDesc(Long clientId);

    long countByClientIdAndReadFalse(Long clientId);

    @Modifying
    @Query("update PriceNotification notification set notification.read = true where notification.client.id = :clientId and notification.read = false")
    int markAllAsReadByClientId(@Param("clientId") Long clientId);
}
