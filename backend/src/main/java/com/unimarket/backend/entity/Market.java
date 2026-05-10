package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

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

@Getter
@Setter
// Soft delete: ao deletar, o mercado fica marcado em deleted_at.
@SQLDelete(sql = "UPDATE markets SET deleted_at = NOW() WHERE id = ?")
// Mercados deletados nao aparecem nas consultas comuns do sistema.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "markets")
@Schema(description = "Entidade representando os supermercados")
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador unico do mercado", example = "1")
    private Long id;

    @Column(name = "name", nullable = false)
    @Schema(description = "Nome do mercado", example = "UniMarket")
    private String name;

    // Campos abaixo sao enriquecidos pela consulta de CNPJ na BrasilAPI.
    @Column(name = "official_name")
    @Schema(description = "Razao social obtida pelo CNPJ", example = "UniMarket LTDA")
    private String officialName;

    @Column(name = "trade_name")
    @Schema(description = "Nome fantasia obtido pelo CNPJ", example = "UniMarket")
    private String tradeName;

    @Column(name = "registration_status")
    @Schema(description = "Situacao cadastral do CNPJ", example = "ATIVA")
    private String registrationStatus;

    @Column(name = "main_activity", length = 500)
    @Schema(description = "Atividade economica principal do CNPJ")
    private String mainActivity;

    @Column(name = "cnpj", unique = true, nullable = false, length = 14)
    @Schema(description = "Documento CNPJ sem tracos ou simbolos", example = "12345678000199")
    private String cnpj;

    @Column(name = "email", unique = true, nullable = false)
    @Schema(description = "E-mail de contato", example = "contact@unimarket.com")
    private String email;

    @Column(name = "password", nullable = false)
    @Schema(description = "Senha criptografada para autenticacao")
    private String password;

    // Endereco usado para exibir o perfil do mercado e calcular distancia para o cliente.
    @Column(name = "street_address")
    @Schema(description = "Endereco fisico do mercado", example = "Rua Dom Lara, 123")
    private String streetAddress;

    @Column(name = "neighborhood")
    @Schema(description = "Bairro do mercado", example = "Centro")
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

    // Coordenadas usadas pela busca "supermercados perto de voce" e links do Google Maps.
    @Column(name = "latitude")
    @Schema(description = "Latitude do mercado", example = "-23.9608")
    private Double latitude;

    @Column(name = "longitude")
    @Schema(description = "Longitude do mercado", example = "-46.3336")
    private Double longitude;

    // Campos temporarios usados no fluxo de recuperacao de senha do supermercado.
    @Column(name = "reset_code", length = 6)
    private String resetCode;

    @Column(name = "reset_code_expires_at")
    private LocalDateTime resetCodeExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o mercado foi criado")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da ultima atualizacao do mercado")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o mercado foi deletado")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        // Preenche datas automaticamente na criacao.
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        // Mantem a data de atualizacao sincronizada em qualquer alteracao.
        this.updatedAt = LocalDateTime.now();
    }
}
