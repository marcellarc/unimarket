package com.unimarket.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

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

    public void sendEmail(String to, String subject, String body) {
        sendHtmlEmail(to, subject, "<pre>" + escapeHtml(body) + "</pre>");
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!StringUtils.hasText(to)) {
            logger.warn("Email nao enviado: destinatario vazio. Assunto: {}", subject);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null
                || !StringUtils.hasText(mailHost)
                || !StringUtils.hasText(mailUsername)
                || !StringUtils.hasText(mailPassword)) {
            logger.warn(
                    "Email simulado para {} porque SMTP nao esta completo. host={}, usernameConfigurado={}, passwordConfigurado={}. Assunto: {} | {}",
                    to,
                    mailHost,
                    StringUtils.hasText(mailUsername),
                    StringUtils.hasText(mailPassword),
                    subject,
                    htmlBody
            );
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MailException | MessagingException exception) {
            logger.error("Falha ao enviar email para {} com assunto {}", to, subject, exception);
        }
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
