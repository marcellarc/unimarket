package com.unimarket.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.unimarket.backend.entity.PriceNotification;

@Service
public class NotificationDeliveryService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationDeliveryService.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    public void deliver(PriceNotification notification) {
        logger.info(
                "Notificacao de preço para {} <{}>: {}",
                notification.getClient().getName(),
                notification.getClient().getEmail(),
                notification.getMessage()
        );
        emailService.sendHtmlEmailAsync(
                notification.getClient().getEmail(),
                "UniMarket - " + notification.getTitle(),
                emailTemplateService.priceAlert(notification)
        );
    }
}
