package com.unimarket.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.product.MarketProductRequestDTO;
import com.unimarket.backend.dto.product.MarketProductResponseDTO;
import com.unimarket.backend.dto.product.ProductRequestDTO;
import com.unimarket.backend.dto.product.ProductResponseDTO;
import com.unimarket.backend.entity.Category;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.entity.MarketProduct;
import com.unimarket.backend.entity.Product;
import com.unimarket.backend.repository.CategoryRepository;
import com.unimarket.backend.repository.MarketProductRepository;
import com.unimarket.backend.repository.MarketRepository;
import com.unimarket.backend.repository.ProductRepository;

// Classe responsável pelas regras de negócio do vínculo entre Mercado e Produto
@Service
public class MarketProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PriceAlertService priceAlertService;

    // Cadastra produto e cria o vínculo com o mercado
    public ProductResponseDTO createProduct(ProductRequestDTO dto, Long marketId) {

        // verifica se o mercado existe
        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // verifica se o produto já existe pelo código de barras
        Optional<Product> existingProduct = productRepository.findByBarCode(dto.getBarCode());

        Product product;

        if (existingProduct.isPresent()) {
            // produto já existe no catálogo — usa o existente
            product = existingProduct.get();

            // verifica se o vínculo entre este mercado e produto já existe
            boolean vinculoExiste = marketProductRepository
                    .findByMarketIdAndProductId(marketId, product.getId())
                    .isPresent();

            if (vinculoExiste) {
                throw new RuntimeException("Este mercado já possui este produto");
            }

        } else {
            // produto novo — busca a categoria e salva no catálogo
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

            // monta a entidade com os dados do DTO
            product = new Product();
            product.setName(dto.getProductName());
            product.setBrand(dto.getBrand());
            product.setDescription(dto.getDescription());
            product.setImageUrl(dto.getImageUrl());
            product.setBarCode(dto.getBarCode());
            product.setCategory(category);

            // salva o produto no catálogo global
            product = productRepository.save(product);
        }

        // cria o vínculo entre mercado e produto (sem preço e estoque por enquanto)
        MarketProduct vinculo = new MarketProduct();
        vinculo.setProduct(product);
        vinculo.setMarket(market);
        marketProductRepository.save(vinculo);

        // retorna os dados do produto cadastrado
        return toResponse(product);
    }

    // Lista todos os produtos vinculados a um mercado específico
    public List<MarketProductResponseDTO> listProductByMarket(Long marketId) {

        // verifica se o mercado existe
        marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // busca todos os vínculos do mercado e mapeia para DTO
        return marketProductRepository.findByMarketId(marketId)
                .stream()
                .map(this::toMercadoProdutoResponse)
                .collect(Collectors.toList());
    }

    // Busca produtos de um mercado pelo nome
    public List<MarketProductResponseDTO> findProducts(Long marketId, String name) {

        // verifica se o mercado existe
        marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // busca os vínculos do mercado e filtra pelo nome do produto
        return marketProductRepository.findByMarketId(marketId)
                .stream()
                .filter(vinculo -> vinculo.getProduct().getName()
                        .toLowerCase().contains(name.toLowerCase())) // filtra ignorando maiúsculas/minúsculas
                .map(this::toMercadoProdutoResponse)
                .collect(Collectors.toList());
    }

    // Busca um produto específico de um mercado pelo ID do produto
    public MarketProductResponseDTO findProductById(Long marketId, Long productId) {

        // verifica se o vínculo entre o mercado e o produto existe
        MarketProduct vinculo = marketProductRepository
                .findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado para este mercado"));

        // retorna os dados do produto vinculado
        return toMercadoProdutoResponse(vinculo);
    }

    // Converte entidade Product para ProductResponseDTO
    private ProductResponseDTO toResponse(Product product) {
        ProductResponseDTO response = new ProductResponseDTO();
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setBrand(product.getBrand());
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getImageUrl());
        response.setBarCode(product.getBarCode());
        response.setCreatedAt(product.getCreatedAt().toLocalDate());

        // pega o nome da categoria se existir
        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }

        return response;
    }

    // Atualiza preço e estoque de um produto vinculado a um mercado
    public MarketProductResponseDTO updateProductPriceAndStock(Long marketId, Long productId, MarketProductRequestDTO dto) {

        // busca o vínculo entre o mercado e o produto
        MarketProduct vinculo = marketProductRepository
                .findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(() -> new RuntimeException("Vínculo entre mercado e produto não encontrado"));

        // atualiza os valores recebidos no DTO
        vinculo.setPrice(dto.getPrice());
        vinculo.setStockQuantity(dto.getStockQuantity());

        // salva o vínculo atualizado no banco
        MarketProduct atualizado = marketProductRepository.save(vinculo);
        priceAlertService.evaluateMarketProduct(atualizado);

        // converte e retorna o response
        return toMercadoProdutoResponse(atualizado);
    }

    // Converte entidade MarketProduct para MarketProductResponseDTO
    private MarketProductResponseDTO toMercadoProdutoResponse(MarketProduct vinculo) {
        MarketProductResponseDTO response = new MarketProductResponseDTO();
        response.setId(vinculo.getId());
        response.setProductId(vinculo.getProduct().getId());
        response.setMarketName(vinculo.getMarket().getName()); // nome do mercado
        response.setProductName(vinculo.getProduct().getName()); // nome do produto
        response.setBrand(vinculo.getProduct().getBrand());   // marca do produto
        response.setPrice(vinculo.getPrice());
        response.setStockQuantity(vinculo.getStockQuantity());
        response.setUpdatedAt(vinculo.getUpdatedAt());
        return response;
    }
}
