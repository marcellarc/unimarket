package com.unimarket.backend.entity.shoppingList;

import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import com.unimarket.backend.entity.Product.MarketProduct;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Entidade que representa um item dentro de uma lista de compras
@Getter
@Setter

// Implementação de soft delete: ao invés de remover o registro, marca como deletado
@SQLDelete(sql = "UPDATE shopping_list_item SET deleted_at = NOW() WHERE id = ?")
// Garante que apenas itens não deletados sejam retornados nas consultas    
@SQLRestriction("deleted_at IS NULL")

@Entity
@Table(name = "shopping_list_item")
public class ShoppingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // lista de compras à qual o item pertence
    @ManyToOne
    @JoinColumn(name = "shopping_list_id", nullable = false)
    private ShoppingList shoppingList;

    // vínculo entre mercado e produto — define qual produto de qual mercado foi adicionado
    @ManyToOne
    @JoinColumn(name = "market_product_id", nullable = false)
    private MarketProduct marketProduct;

    // quantidade do produto na lista
    @Column(nullable = false)
    private Integer quantity;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // nulo significa que o item está ativo — soft delete
    @Column(name = "deleted_at")
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