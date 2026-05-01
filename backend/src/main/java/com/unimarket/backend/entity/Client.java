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

// Entidade que representa um cliente do sistema
@Getter
@Setter

// Implementação de soft delete: ao invés de remover o registro, marca como deletado
@SQLDelete(sql = "UPDATE clients SET deleted_at = NOW() WHERE id = ?")
// Garante que apenas clientes não deletados sejam retornados nas consultas
@SQLRestriction("deleted_at IS NULL")

@Entity
@Table(name = "clients")
@Schema(description = "Entidade representando um cliente do sistema")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do cliente", example = "1")
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    @Schema(description = "Nome do cliente", example = "João")
    private String name;

    @Column(unique = true)
    @Schema(description = "E-mail do cliente", example = "cliente@gmail.com")
    private String email;

    // senha armazenada sempre com hash (BCrypt)
    @Column(name = "password", nullable = false)
    @Schema(description = "Senha criptografada para autenticação")
    private String password;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o cliente foi criado")
    private LocalDateTime createdAt;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da última atualização do cliente")
    private LocalDateTime updatedAt;

    // nulo significa que o cliente está ativo — soft delete
    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o cliente foi deletado")
    private LocalDateTime deletedAt;

    // código de 6 dígitos enviado para redefinição de senha
    @Column(name = "reset_code", length = 6)
    private String resetCode;

    // data de expiração do código de redefinição de senha
    @Column(name = "reset_code_expires_at")
    private LocalDateTime resetCodeExpiresAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now(); // inicializa junto com createdAt
    }

    @PreUpdate
    public void preUpdate() {
        // atualiza a data a cada alteração no registro
        this.updatedAt = LocalDateTime.now();
    }
}