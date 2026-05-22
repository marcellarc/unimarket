package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Entidade que representa o feedback de um cliente sobre um produto
@Getter
@Setter

// Implementação de soft delete: ao invés de remover o registro, marca como deletado
@SQLDelete(sql = "UPDATE feedbacks SET deleted_at = NOW() WHERE cd_feedback = ?")
// Garante que apenas feedbacks não deletados sejam retornados nas consultas
@SQLRestriction("deleted_at IS NULL")

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdFeedback;

    // cliente que realizou o feedback
    @ManyToOne
    @JoinColumn(name = "cd_cliente", nullable = false)
    private Client cliente;

    // produto avaliado
    @ManyToOne
    @JoinColumn(name = "cd_produto", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "market_id")
    private Market market;

    // nota de avaliação do produto
    @Column(nullable = false)
    private Integer vlNota;

    // comentário opcional do cliente
    @Column(length = 500)
    private String dsComentario;

    @Column(name = "market_reply", length = 500)
    private String marketReply;

    @Column(name = "market_replied_at")
    private LocalDateTime marketRepliedAt;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // nulo significa que o feedback está ativo — soft delete
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
    }
}
