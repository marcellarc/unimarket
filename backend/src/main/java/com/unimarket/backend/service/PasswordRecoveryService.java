package com.unimarket.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.unimarket.backend.dto.password.PasswordRecoverDTO;
import com.unimarket.backend.dto.password.PasswordResetDTO;
import com.unimarket.backend.dto.password.PasswordVerifyCodeDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.MarketRepository;

@Service
public class PasswordRecoveryService {

    private static final int CODE_EXPIRATION_MINUTES = 15;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Transactional
    public void requestRecovery(PasswordRecoverDTO dto) {
        String email = normalizeEmail(dto.email());
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES);

        Client client = clientRepository.findByEmail(email).orElse(null);
        if (client != null) {
            client.setResetCode(code);
            client.setResetCodeExpiresAt(expiresAt);
            clientRepository.save(client);
            sendRecoveryEmail(client.getEmail(), client.getName(), code);
            return;
        }

        Market market = marketRepository.findByEmail(email).orElse(null);
        if (market != null) {
            market.setResetCode(code);
            market.setResetCodeExpiresAt(expiresAt);
            marketRepository.save(market);
            sendRecoveryEmail(market.getEmail(), market.getName(), code);
        }
    }

    @Transactional(readOnly = true)
    public boolean verifyCode(PasswordVerifyCodeDTO dto) {
        String email = normalizeEmail(dto.email());
        String code = dto.code();

        Client client = clientRepository.findByEmail(email).orElse(null);
        if (client != null) {
            return isValidCode(client.getResetCode(), client.getResetCodeExpiresAt(), code);
        }

        Market market = marketRepository.findByEmail(email).orElse(null);
        return market != null && isValidCode(market.getResetCode(), market.getResetCodeExpiresAt(), code);
    }

    @Transactional
    public void resetPassword(PasswordResetDTO dto) {
        String email = normalizeEmail(dto.email());

        Client client = clientRepository.findByEmail(email).orElse(null);
        if (client != null) {
            validateCodeOrThrow(client.getResetCode(), client.getResetCodeExpiresAt(), dto.code());
            client.setPassword(passwordEncoder.encode(dto.newPassword()));
            client.setResetCode(null);
            client.setResetCodeExpiresAt(null);
            clientRepository.save(client);
            return;
        }

        Market market = marketRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Codigo invalido ou expirado"));

        validateCodeOrThrow(market.getResetCode(), market.getResetCodeExpiresAt(), dto.code());
        market.setPassword(passwordEncoder.encode(dto.newPassword()));
        market.setResetCode(null);
        market.setResetCodeExpiresAt(null);
        marketRepository.save(market);
    }

    private void sendRecoveryEmail(String email, String name, String code) {
        String body = emailTemplateService.passwordRecovery(name, code, CODE_EXPIRATION_MINUTES);
        emailService.sendHtmlEmail(email, "UniMarket - Recuperação de senha", body);
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private boolean isValidCode(String savedCode, LocalDateTime expiresAt, String code) {
        return StringUtils.hasText(savedCode)
                && savedCode.equals(code)
                && expiresAt != null
                && expiresAt.isAfter(LocalDateTime.now());
    }

    private void validateCodeOrThrow(String savedCode, LocalDateTime expiresAt, String code) {
        if (!isValidCode(savedCode, expiresAt, code)) {
            throw new RuntimeException("Código inválido ou expirado");
        }
    }
}
