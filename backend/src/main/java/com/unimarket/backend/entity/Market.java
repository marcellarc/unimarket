package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "markets")
@Schema(description = "Entidade representando os Supermercados")
@Getter
@Setter
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do mercado", example = "1")
    private Long id;

    @Column(name = "name", nullable = false)
    @Schema(description = "Nome do mercado", example = "UniMarket")
    private String name;

    @Column(name = "cnpj", unique = true, nullable = false, length = 14)
    @Schema(description = "Documento CNPJ (sem traços ou símbolos)", example = "12345678000199")
    private String cnpj;

    @Column(name = "email", unique = true, nullable = false)
    @Schema(description = "E-mail de contato", example = "contact@unimarket.com")
    private String email;

    @Column(name = "password", nullable = false)
    @Schema(description = "Senha criptografada para autenticação")
    private String password;

    @Column(name = "street_address")
    @Schema(description = "Endereço físico do mercado", example = "Rua Dom Lara, 123")
    private String streetAddress;

    @Column(name = "neighborhood")
    @Schema(description = "Bairro do mercado", example = "Downtown")
    private String neighborhood;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o mercado foi criado")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(name = "reset_code", length = 6)
    private String resetCode;

    @Column(name = "reset_code_expires_at")
    private LocalDateTime resetCodeExpiresAt;

}
