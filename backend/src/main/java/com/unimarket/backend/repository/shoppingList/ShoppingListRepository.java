package com.unimarket.backend.repository.shoppingList;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.shoppingList.ShoppingList;

// interface responsável por acessar o banco de dados da entidade ShoppingList
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    // busca todas as listas ativas de um cliente específico
    List<ShoppingList> findByClientId(Long clientId);
}