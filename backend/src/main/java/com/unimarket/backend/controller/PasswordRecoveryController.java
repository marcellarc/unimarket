package com.unimarket.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.password.PasswordRecoverDTO;
import com.unimarket.backend.dto.password.PasswordResetDTO;
import com.unimarket.backend.dto.password.PasswordVerifyCodeDTO;
import com.unimarket.backend.service.PasswordRecoveryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/password")
@Tag(name = "Authentication", description = "Rotas de autenticação, cadastro e recuperação de senha")
public class PasswordRecoveryController {

    @Autowired
    private PasswordRecoveryService passwordRecoveryService;

    @PostMapping("/recover")
    @Operation(summary = "Solicitar código de recuperação por e-mail")
    public ResponseEntity<Map<String, String>> requestRecovery(@RequestBody @Valid PasswordRecoverDTO dto) {
        passwordRecoveryService.requestRecovery(dto);
        return ResponseEntity.ok(Map.of(
                "message",
                "Se o e-mail estiver cadastrado, um código de recuperação será enviado."
        ));
    }

    @PostMapping("/verify-code")
    @Operation(summary = "Verificar código de recuperação")
    public ResponseEntity<Map<String, Boolean>> verifyCode(@RequestBody @Valid PasswordVerifyCodeDTO dto) {
        return ResponseEntity.ok(Map.of("valid", passwordRecoveryService.verifyCode(dto)));
    }

    @PostMapping("/reset")
    @Operation(summary = "Redefinir senha usando código de recuperação")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody @Valid PasswordResetDTO dto) {
        passwordRecoveryService.resetPassword(dto);
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso!"));
    }
}
