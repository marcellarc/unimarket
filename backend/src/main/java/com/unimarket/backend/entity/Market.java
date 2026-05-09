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

    @Column(name = "official_name")
    @Schema(description = "Razão social obtida pelo CNPJ", example = "UniMarket LTDA")
    private String officialName;

    @Column(name = "trade_name")
    @Schema(description = "Nome fantasia obtido pelo CNPJ", example = "UniMarket")
    private String tradeName;

    @Column(name = "registration_status")
    @Schema(description = "Situação cadastral do CNPJ", example = "ATIVA")
    private String registrationStatus;

    @Column(name = "main_activity", length = 500)
    @Schema(description = "Atividade econômica principal do CNPJ")
    private String mainActivity;

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

    @Column(name = "city")
    @Schema(description = "Cidade do mercado", example = "Santos")
    private String city;

    @Column(name = "state", length = 2)
    @Schema(description = "UF do mercado", example = "SP")
    private String state;

    @Column(name = "zip_code", length = 12)
    @Schema(description = "CEP do mercado", example = "11000000")
    private String zipCode;

    @Column(name = "latitude")
    @Schema(description = "Latitude do mercado", example = "-23.9608")
    private Double latitude;

    @Column(name = "longitude")
    @Schema(description = "Longitude do mercado", example = "-46.3336")
    private Double longitude;

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
