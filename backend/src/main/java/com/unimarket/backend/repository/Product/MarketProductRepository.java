package com.unimarket.backend.repository.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.product.MarketProduct;

// Interface responsável por acessar o banco de dados da entidade MercadoProduto
public interface MarketProductRepository extends JpaRepository<MarketProduct, Long> {

    // busca todos os vínculos de um mercado específico
    List<MarketProduct> findByMarketId(Long id);

    // busca todos os mercados que vendem um produto específico
    List<MarketProduct> findByProductId(Long id);

    // verifica se já existe o vínculo entre um mercado e um produto — usado para evitar duplicata
    Optional<MarketProduct> findByMarketIdAndProductId(Long marketId, Long productId);
}
