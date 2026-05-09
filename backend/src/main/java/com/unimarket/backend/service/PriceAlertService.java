package com.unimarket.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unimarket.backend.dto.notification.PriceAlertRequestDTO;
import com.unimarket.backend.dto.notification.PriceAlertResponseDTO;
import com.unimarket.backend.dto.notification.PriceNotificationResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.PriceAlert;
import com.unimarket.backend.entity.PriceNotification;
import com.unimarket.backend.entity.product.MarketProduct;
import com.unimarket.backend.repository.PriceAlertRepository;
import com.unimarket.backend.repository.PriceNotificationRepository;
import com.unimarket.backend.repository.product.MarketProductRepository;

@Service
public class PriceAlertService {

    @Autowired
    private PriceAlertRepository priceAlertRepository;

    @Autowired
    private PriceNotificationRepository priceNotificationRepository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    @Autowired
    private NotificationDeliveryService notificationDeliveryService;

    @Transactional
    public PriceAlertResponseDTO createAlert(Client client, PriceAlertRequestDTO dto) {
        MarketProduct marketProduct = marketProductRepository.findById(dto.getMarketProductId())
                .orElseThrow(() -> new RuntimeException("Produto do mercado nao encontrado"));

        PriceAlert alert = priceAlertRepository
                .findByClientIdAndMarketProductIdAndActiveTrue(client.getId(), dto.getMarketProductId())
                .orElseGet(PriceAlert::new);

        alert.setClient(client);
        alert.setMarketProduct(marketProduct);
        alert.setDesiredPrice(dto.getDesiredPrice());
        alert.setActive(true);
        alert.setNotifiedAt(null);

        PriceAlert savedAlert = priceAlertRepository.save(alert);
        evaluateAlert(savedAlert);

        return toAlertResponse(savedAlert);
    }

    @Transactional(readOnly = true)
    public List<PriceAlertResponseDTO> listAlerts(Client client) {
        return priceAlertRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toAlertResponse)
                .toList();
    }

    @Transactional
    public void deactivateAlert(Client client, Long alertId) {
        PriceAlert alert = priceAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alerta nao encontrado"));

        if (!alert.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Alerta nao pertence ao cliente autenticado");
        }

        alert.setActive(false);
        priceAlertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<PriceNotificationResponseDTO> listNotifications(Client client) {
        return priceNotificationRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnreadNotifications(Client client) {
        return priceNotificationRepository.countByClientIdAndReadFalse(client.getId());
    }

    @Transactional
    public void markAllNotificationsAsRead(Client client) {
        priceNotificationRepository.markAllAsReadByClientId(client.getId());
    }

    @Transactional
    public void evaluateMarketProduct(MarketProduct marketProduct) {
        if (marketProduct.getPrice() == null) {
            return;
        }

        priceAlertRepository.findTriggeredAlerts(marketProduct.getId())
                .forEach(this::triggerAlert);
    }

    private void evaluateAlert(PriceAlert alert) {
        MarketProduct marketProduct = alert.getMarketProduct();
        boolean hasPrice = marketProduct.getPrice() != null;
        boolean hasStock = marketProduct.getStockQuantity() == null || marketProduct.getStockQuantity() > 0;

        if (alert.getActive() && hasPrice && hasStock && marketProduct.getPrice() <= alert.getDesiredPrice()) {
            triggerAlert(alert);
        }
    }

    private void triggerAlert(PriceAlert alert) {
        MarketProduct marketProduct = alert.getMarketProduct();
        String productName = marketProduct.getProduct().getName();
        String marketName = marketProduct.getMarket().getName();

        PriceNotification notification = new PriceNotification();
        notification.setClient(alert.getClient());
        notification.setPriceAlert(alert);
        notification.setMarketProduct(marketProduct);
        notification.setTargetPrice(alert.getDesiredPrice());
        notification.setCurrentPrice(marketProduct.getPrice());
        notification.setTitle("Preço desejado atingido!");
        notification.setMessage(productName + " chegou a R$ " + String.format("%.2f", marketProduct.getPrice())
                + " no " + marketName + ".");

        PriceNotification savedNotification = priceNotificationRepository.save(notification);

        alert.setActive(false);
        alert.setNotifiedAt(LocalDateTime.now());
        priceAlertRepository.save(alert);

        notificationDeliveryService.deliver(savedNotification);
    }

    private PriceAlertResponseDTO toAlertResponse(PriceAlert alert) {
        PriceAlertResponseDTO response = new PriceAlertResponseDTO();
        response.setId(alert.getId());
        response.setMarketProductId(alert.getMarketProduct().getId());
        response.setProductName(alert.getMarketProduct().getProduct().getName());
        response.setMarketName(alert.getMarketProduct().getMarket().getName());
        response.setDesiredPrice(alert.getDesiredPrice());
        response.setCurrentPrice(alert.getMarketProduct().getPrice());
        response.setActive(alert.getActive());
        response.setCreatedAt(alert.getCreatedAt());
        response.setNotifiedAt(alert.getNotifiedAt());
        return response;
    }

    private PriceNotificationResponseDTO toNotificationResponse(PriceNotification notification) {
        PriceNotificationResponseDTO response = new PriceNotificationResponseDTO();
        response.setId(notification.getId());
        response.setMarketProductId(notification.getMarketProduct().getId());
        response.setProductName(notification.getMarketProduct().getProduct().getName());
        response.setMarketName(notification.getMarketProduct().getMarket().getName());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setTargetPrice(notification.getTargetPrice());
        response.setCurrentPrice(notification.getCurrentPrice());
        response.setRead(notification.getRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
