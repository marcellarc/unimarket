package com.unimarket.backend.repository.shoppingList;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.shoppingList.ShoppingListItem;

// interface responsável por acessar o banco de dados da entidade ShoppingListItem
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    // busca todos os itens ativos de uma lista específica
    List<ShoppingListItem> findByShoppingListId(Long shoppingListId);

    // verifica se já existe o mesmo produto de um mercado na lista — evita duplicatas
    boolean existsByShoppingListIdAndMarketProductId(Long shoppingListId, Long marketProductId);
}