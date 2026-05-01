package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Entidade que representa um supermercado no sistema
@Getter
@Setter
@Entity
@Table(name = "markets")
@Schema(description = "Entidade representando os Supermercados")
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do mercado", example = "1")
    private Long id;

    // nome do mercado
    @Column(name = "name", nullable = false)
    @Schema(description = "Nome do mercado", example = "UniMarket")
    private String name;

    // CNPJ único — armazenado sem traços ou símbolos
    @Column(name = "cnpj", unique = true, nullable = false, length = 14)
    @Schema(description = "Documento CNPJ (sem traços ou símbolos)", example = "12345678000199")
    private String cnpj;

    // email usado para login
    @Column(name = "email", unique = true, nullable = false)
    @Schema(description = "E-mail de contato", example = "contact@unimarket.com")
    private String email;

    // senha armazenada sempre com hash (BCrypt)
    @Column(name = "password", nullable = false)
    @Schema(description = "Senha criptografada para autenticação")
    private String password;

    // endereço físico do mercado
    @Column(name = "street_address")
    @Schema(description = "Endereço físico do mercado", example = "Rua Dom Lara, 123")
    private String streetAddress;

    // bairro do mercado
    @Column(name = "neighborhood")
    @Schema(description = "Bairro do mercado", example = "Downtown")
    private String neighborhood;

    // código de 6 dígitos enviado para redefinição de senha
    @Column(name = "reset_code", length = 6)
    private String resetCode;

    // data de expiração do código de redefinição de senha
    @Column(name = "reset_code_expires_at")
    private LocalDateTime resetCodeExpiresAt;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o mercado foi criado")
    private LocalDateTime createdAt;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at",  nullable = false)
    @Schema(description = "Timestamp da última atualização do mercado")
    private LocalDateTime updatedAt;

    // nulo significa que o mercado está ativo — soft delete
    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o mercado foi deletado")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        // atualiza a data a cada alteração no registro
        this.updatedAt = LocalDateTime.now();
    }
}