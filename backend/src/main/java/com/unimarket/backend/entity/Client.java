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
// Soft delete: remove logicamente o cliente sem apagar o registro do banco.
@SQLDelete(sql = "UPDATE clients SET deleted_at = NOW() WHERE id = ?")
// Todas as consultas JPA ignoram clientes marcados como deletados.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "clients")
@Schema(description = "Entidade representando um cliente do sistema")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador unico do cliente", example = "1")
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    @Schema(description = "Nome do cliente", example = "Joao")
    private String name;

    @Column(unique = true)
    @Schema(description = "E-mail do cliente", example = "cliente@gmail.com")
    private String email;

    @Column(name = "password", nullable = false)
    @Schema(description = "Senha criptografada para autenticacao")
    private String password;

    // Dados de endereco usados para localizar supermercados proximos ao cliente.
    @Column(name = "street_address")
    private String streetAddress;

    @Column(name = "neighborhood")
    private String neighborhood;

    @Column(name = "city")
    private String city;

    @Column(name = "state", length = 2)
    private String state;

    @Column(name = "zip_code", length = 8)
    private String zipCode;

    // Coordenadas podem vir do navegador, CEP/BrasilAPI ou outro servico de geocoding.
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "location_source")
    private String locationSource;

    // URL da imagem escolhida pelo usuario; o arquivo em si nao fica salvo nesta entidade.
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    // Raio padrao usado na busca de mercados proximos.
    @Column(name = "search_radius_km")
    private Double searchRadiusKm;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o cliente foi criado")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da ultima atualizacao do cliente")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o cliente foi deletado")
    private LocalDateTime deletedAt;

    // Campos temporarios usados no fluxo de recuperacao de senha.
    @Column(name = "reset_code", length = 6)
    private String resetCode;

    @Column(name = "reset_code_expires_at")
    private LocalDateTime resetCodeExpiresAt;

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
