package com.unimarket.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Produto;

// Interface responsável por acessar o banco de dados da entidade Produto
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Busca produtos pelo nome (usando o campo nmProduto)
    List<Produto> findByNmProdutoContainingIgnoreCase(String nome);
}