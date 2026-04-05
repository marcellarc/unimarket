package com.unimarket.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Produto;

// Interface responsável por acessar o banco de dados da entidade Produto
public interface ProdutoRepository extends JpaRepository<Produto, Long> { // Long correto para IDENTITY

    // Busca produtos pelo nome (sem diferenciar maiúsculas/minúsculas)
    List<Produto> findByNmProdutoContainingIgnoreCase(String nome);

    // Busca produto pelo código de barras — usado para evitar duplicatas no cadastro
    Optional<Produto> findByDsCodBarra(String dsCodBarra);
}