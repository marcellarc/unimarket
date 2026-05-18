package com.unimarket.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unimarket.backend.dto.CosmosProductDTO;
import com.unimarket.backend.dto.MarketProductRequestDTO;
import com.unimarket.backend.dto.MarketProductResponseDTO;
import com.unimarket.backend.dto.ProductRequestDTO;
import com.unimarket.backend.dto.ProductResponseDTO;
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

    // injeta o service responsável por consultar a API Cosmos
    @Autowired
    private CosmosService cosmosService;

    // Cadastra produto e cria o vínculo com o mercado
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO dto, Long marketId) {

        String normalizedBarCode = normalizeBarCode(dto.getBarCode());

        // verifica se o mercado existe
        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // verifica se o produto já existe pelo código de barras
        Optional<Product> existingProduct = hasText(normalizedBarCode)
                ? productRepository.findByBarCode(normalizedBarCode)
                : Optional.empty();

        Product product;

        if (existingProduct.isPresent()) {

            // produto já existe no catálogo — usa o existente
            product = existingProduct.get();

        } else {

            // consulta a API Cosmos pelo código de barras
            CosmosProductDTO cosmosProduct = hasText(normalizedBarCode)
                    ? cosmosService.findByBarCode(normalizedBarCode)
                    : null;

            // monta a entidade produto
            product = new Product();
            product.setBarCode(normalizedBarCode);

            if (cosmosProduct != null) {

                // produto encontrado na Cosmos — preenche automaticamente
                product.setName(cosmosProduct.getDescription());
                product.setBrand(
                        cosmosProduct.getBrand() != null
                        ? cosmosProduct.getBrand().getName()
                        : dto.getBrand()
                );
                product.setImageUrl(cosmosProduct.getThumbnail());
                product.setDescription(cosmosProduct.getDescription());

            } else {

                // produto não encontrado na Cosmos — valida preenchimento manual
                if (dto.getProductName() == null || dto.getProductName().isBlank()) {
                    throw new RuntimeException(
                            "Produto não encontrado. Preencha o nome do produto manualmente."
                    );
                }

                if (dto.getBrand() == null || dto.getBrand().isBlank()) {
                    throw new RuntimeException(
                            "Produto não encontrado. Preencha a marca do produto manualmente."
                    );
                }

                // usa os dados enviados manualmente
                product.setName(dto.getProductName());
                product.setBrand(dto.getBrand());
                product.setDescription(dto.getDescription());
                product.setImageUrl(dto.getImageUrl());
            }

            // busca a categoria
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

            product.setCategory(category);

            // salva o produto no catálogo global
            product = productRepository.save(product);
        }

        Optional<MarketProduct> existingVinculo
                = marketProductRepository.findAnyByMarketIdAndProductId(
                        marketId,
                        product.getId()
                );

        if (existingVinculo.isPresent()) {

            MarketProduct vinculo = existingVinculo.get();

            if (vinculo.getDeletedAt() == null) {
                throw new RuntimeException("Este mercado já possui este produto");
            }

            vinculo.setDeletedAt(null);
            vinculo.setPrice(dto.getPrice());
            vinculo.setStockQuantity(dto.getStockQuantity());

            marketProductRepository.save(vinculo);

            return toResponse(product);
        }

        // cria o vínculo entre mercado e produto
        MarketProduct vinculo = new MarketProduct();

        vinculo.setProduct(product);
        vinculo.setMarket(market);
        vinculo.setPrice(dto.getPrice());
        vinculo.setStockQuantity(dto.getStockQuantity());

        marketProductRepository.save(vinculo);

        return toResponse(product);
    }

    // Lista todos os produtos vinculados a um mercado específico
    public List<MarketProductResponseDTO> listProductByMarket(Long marketId) {

        marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        return marketProductRepository.findByMarketId(marketId)
                .stream()
                .map(this::toMercadoProdutoResponse)
                .collect(Collectors.toList());
    }

    // Busca produtos de um mercado pelo nome
    public List<MarketProductResponseDTO> findProducts(Long marketId, String name) {

        marketRepository.findById(marketId)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        return marketProductRepository.findByMarketId(marketId)
                .stream()
                .filter(vinculo
                        -> vinculo.getProduct()
                        .getName()
                        .toLowerCase()
                        .contains(name.toLowerCase())
                )
                .map(this::toMercadoProdutoResponse)
                .collect(Collectors.toList());
    }

    // Busca um produto específico de um mercado
    public MarketProductResponseDTO findProductById(Long marketId, Long productId) {

        MarketProduct vinculo = marketProductRepository
                .findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(()
                        -> new RuntimeException("Produto não encontrado para este mercado")
                );

        return toMercadoProdutoResponse(vinculo);
    }

    // Atualiza preço e estoque
    public MarketProductResponseDTO updateProductPriceAndStock(
            Long marketId,
            Long productId,
            MarketProductRequestDTO dto
    ) {

        MarketProduct vinculo = marketProductRepository
                .findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(()
                        -> new RuntimeException(
                        "Vínculo entre mercado e produto não encontrado"
                )
                );

        vinculo.setPrice(dto.getPrice());
        vinculo.setStockQuantity(dto.getStockQuantity());

        MarketProduct atualizado = marketProductRepository.save(vinculo);

        priceAlertService.evaluateMarketProduct(atualizado);

        return toMercadoProdutoResponse(atualizado);
    }

    // Soft delete do vínculo
    public void deleteMarketProduct(Long marketId, Long productId) {

        MarketProduct vinculo = marketProductRepository
                .findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(()
                        -> new RuntimeException(
                        "Vínculo entre mercado e produto não encontrado"
                )
                );

        marketProductRepository.delete(vinculo);
    }

    // Lista todos os market_products paginados
    public Page<MarketProductResponseDTO> listAllProducts(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<MarketProduct> marketProducts
                = marketProductRepository.findAll(pageable);

        return marketProducts.map(this::toMercadoProdutoResponse);
    }

    // busca produtos por nome com paginação
    public Page<MarketProductResponseDTO> findProductsByName(
            String name,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<MarketProduct> marketProducts
                = marketProductRepository
                        .findByProduct_NameContainingIgnoreCase(
                                name,
                                pageable
                        );

        return marketProducts.map(this::toMercadoProdutoResponse);
    }

    // busca produtos por nome e faixa de preço
    public Page<MarketProductResponseDTO> findProductsByNameAndPriceRange(
            String name,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<MarketProduct> marketProducts
                = marketProductRepository
                        .findByProduct_NameContainingIgnoreCaseAndPriceBetween(
                                name,
                                minPrice,
                                maxPrice,
                                pageable
                        );

        return marketProducts.map(this::toMercadoProdutoResponse);
    }

    // Converte Product para ProductResponseDTO
    private ProductResponseDTO toResponse(Product product) {

        ProductResponseDTO response = new ProductResponseDTO();

        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setBrand(product.getBrand());
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getImageUrl());
        response.setBarCode(product.getBarCode());
        response.setCreatedAt(product.getCreatedAt().toLocalDate());

        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }

        return response;
    }

    // Converte MarketProduct para DTO
    private MarketProductResponseDTO toMercadoProdutoResponse(
            MarketProduct vinculo
    ) {

        MarketProductResponseDTO response
                = new MarketProductResponseDTO();

        response.setId(vinculo.getId());

        response.setProductId(vinculo.getProduct().getId());
        response.setMarketId(vinculo.getMarket().getId());

        response.setMarketName(vinculo.getMarket().getName());

        response.setProductName(vinculo.getProduct().getName());
        response.setBrand(vinculo.getProduct().getBrand());
        response.setBarCode(vinculo.getProduct().getBarCode());
        response.setDescription(vinculo.getProduct().getDescription());
        response.setImageUrl(vinculo.getProduct().getImageUrl());

        if (vinculo.getProduct().getCategory() != null) {
            response.setCategoryName(
                    vinculo.getProduct().getCategory().getName()
            );
        }

        response.setPrice(vinculo.getPrice());
        response.setStockQuantity(vinculo.getStockQuantity());
        response.setUpdatedAt(vinculo.getUpdatedAt());

        return response;
    }

    private String normalizeBarCode(String barCode) {

        if (barCode == null) {
            return null;
        }

        String normalized = barCode.replaceAll("\\D", "");

        return normalized.isBlank() ? null : normalized;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
