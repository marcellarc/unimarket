package com.unimarket.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.MercadoProduto;

// Interface responsável por acessar o banco de dados da entidade MercadoProduto
public interface MercadoProdutoRepository extends JpaRepository<MercadoProduto, Long> {

    // busca todos os vínculos de um mercado específico
    List<MercadoProduto> findBySupermercadoCdMercado(Long cdMercado);

    // busca todos os mercados que vendem um produto específico
    List<MercadoProduto> findByProdutoCdProduto(Long cdProduto);

    // verifica se já existe o vínculo entre um mercado e um produto — usado para evitar duplicata
    Optional<MercadoProduto> findBySupermercadoCdMercadoAndProdutoCdProduto(Long cdMercado, Long cdProduto);
}