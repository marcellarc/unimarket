package com.unimarket.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public enum DeliveryStatus {
        FAILED,
        SENT,
        SIMULATED,
        SKIPPED
    }

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:no-reply@unimarket.local}")
    private String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    @PostConstruct
    public void logMailStatus() {
        if (isSmtpConfigured()) {
            logger.info("SMTP configurado para envio de e-mails. host={}, usernameConfigurado=true, from={}", mailHost, from);
            return;
        }

        logger.warn(
                "SMTP não configurado. E-mails serão simulados nos logs. host={}, usernameConfigurado={}, passwordConfigurado={}",
                mailHost,
                StringUtils.hasText(mailUsername),
                StringUtils.hasText(mailPassword)
        );
    }

    public DeliveryStatus sendEmail(String to, String subject, String body) {
        return sendHtmlEmail(to, subject, "<pre>" + escapeHtml(body) + "</pre>");
    }

    public DeliveryStatus sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!StringUtils.hasText(to)) {
            logger.warn("E-mail não enviado: destinatário vazio. Assunto: {}", subject);
            return DeliveryStatus.SKIPPED;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || !isSmtpConfigured()) {
            logger.warn(
                    "E-mail simulado para {} porque SMTP não está completo. host={}, usernameConfigurado={}, passwordConfigurado={}. Assunto: {} | {}",
                    to,
                    mailHost,
                    StringUtils.hasText(mailUsername),
                    StringUtils.hasText(mailPassword),
                    subject,
                    htmlBody
            );
            return DeliveryStatus.SIMULATED;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            logger.info("E-mail enviado para {} com assunto {}", to, subject);
            return DeliveryStatus.SENT;
        } catch (MailException | MessagingException exception) {
            logger.error("Falha ao enviar e-mail para {} com assunto {}", to, subject, exception);
            return DeliveryStatus.FAILED;
        }
    }

    @Async("mailTaskExecutor")
    public void sendHtmlEmailAsync(String to, String subject, String htmlBody) {
        DeliveryStatus deliveryStatus = sendHtmlEmail(to, subject, htmlBody);

        if (deliveryStatus != DeliveryStatus.SENT) {
            logger.warn("E-mail em background não entregue para {}. status={}", to, deliveryStatus);
        }
    }

    public boolean isSmtpConfigured() {
        return StringUtils.hasText(mailHost)
                && StringUtils.hasText(mailUsername)
                && StringUtils.hasText(mailPassword);
    }

    public boolean canSendEmail() {
        return mailSenderProvider.getIfAvailable() != null && isSmtpConfigured();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
