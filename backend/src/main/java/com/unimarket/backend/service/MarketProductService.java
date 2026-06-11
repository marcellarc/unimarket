package com.unimarket.backend.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
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
import com.unimarket.backend.dto.location.CepLocationResponseDTO;
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

    @Autowired
    private LocationService locationService;

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

            product.setCategory(resolveCategory(dto, cosmosProduct));

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
        Market market = resolveMarketCoordinates(vinculo.getMarket());

        response.setId(vinculo.getId());

        response.setProductId(vinculo.getProduct().getId());
        response.setMarketId(market.getId());

        response.setMarketName(market.getName());
        response.setMarketLatitude(market.getLatitude());
        response.setMarketLongitude(market.getLongitude());

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

    private Category resolveCategory(ProductRequestDTO dto, CosmosProductDTO cosmosProduct) {
        Long categoryId = dto.getCategoryId();
        if (categoryId != null && categoryId > 0) {
            return categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        }

        String cosmosCategoryName = simplifyCategoryName(extractCosmosCategoryName(cosmosProduct));

        if (hasText(cosmosCategoryName)) {
            String normalizedName = normalizeCategoryName(toBroadCategoryName(cosmosCategoryName));

            return categoryRepository.findByNameIgnoreCase(normalizedName)
                    .or(() -> findBestExistingCategory(cosmosCategoryName))
                    .orElseGet(() -> {
                        Category category = new Category();
                        category.setName(normalizedName);
                        return categoryRepository.save(category);
                    });
        }

        throw new RuntimeException("Categoria não encontrada. Selecione uma categoria manualmente.");
    }

    private Optional<Category> findBestExistingCategory(String sourceCategoryName) {
        String sourceKey = categoryMatchKey(sourceCategoryName);
        String broadKey = categoryMatchKey(toBroadCategoryName(sourceCategoryName));

        return categoryRepository.findAll()
                .stream()
                .filter(category -> {
                    String categoryKey = categoryMatchKey(category.getName());
                    return hasText(categoryKey)
                            && (categoryKey.equals(sourceKey)
                            || categoryKey.equals(broadKey)
                            || sourceKey.contains(categoryKey)
                            || broadKey.contains(categoryKey));
                })
                .findFirst();
    }

    private String extractCosmosCategoryName(CosmosProductDTO cosmosProduct) {
        if (cosmosProduct == null) {
            return null;
        }

        if (cosmosProduct.getCategory() != null && hasText(cosmosProduct.getCategory().getDescription())) {
            return cosmosProduct.getCategory().getDescription();
        }

        return cosmosProduct.getGpc() != null ? cosmosProduct.getGpc().getDescription() : null;
    }

    private String normalizeCategoryName(String value) {
        return value.trim().replaceAll("\\s+", " ");
    }

    private String toBroadCategoryName(String value) {
        String normalizedValue = normalizeForMatching(value);

        if (containsAny(normalizedValue, "biscoito", "bolacha", "cookie")) {
            return "Biscoitos";
        }

        if (containsAny(normalizedValue, "refrigerante")) {
            return "Refrigerantes";
        }

        if (containsAny(normalizedValue, "bebida", "suco", "agua")) {
            return "Bebidas";
        }

        if (containsAny(normalizedValue, "leite", "iogurte", "queijo", "laticinio")) {
            return "Laticínios";
        }

        if (containsAny(normalizedValue, "carne", "frango", "bovina", "suina", "peixe")) {
            return "Carnes";
        }

        if (containsAny(normalizedValue, "limpeza", "detergente", "sabao", "desinfetante")) {
            return "Limpeza";
        }

        if (containsAny(normalizedValue, "massa", "macarrao")) {
            return "Massas";
        }

        if (containsAny(normalizedValue, "oleo", "azeite")) {
            return "Óleos";
        }

        if (containsAny(normalizedValue, "arroz", "feijao", "acucar", "farinha", "sal")) {
            return "Básicos";
        }

        String withoutParentheses = value.replaceAll("\\s*\\([^)]*\\)", "");
        String firstCategory = withoutParentheses.split("\\s*[-/]\\s*")[0];
        List<String> meaningfulWords = List.of(normalizeCategoryName(firstCategory).split("\\s+"))
                .stream()
                .filter(word -> !isCategoryDescriptor(word))
                .limit(2)
                .toList();

        return meaningfulWords.isEmpty()
                ? normalizeCategoryName(firstCategory)
                : String.join(" ", meaningfulWords);
    }

    private boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (value.contains(term)) {
                return true;
            }
        }

        return false;
    }

    private boolean isCategoryDescriptor(String value) {
        String normalizedValue = normalizeForMatching(value);
        return List.of(
                "recheado",
                "doce",
                "salgado",
                "integral",
                "diet",
                "light",
                "zero",
                "tradicional",
                "especial",
                "pronto",
                "pronta",
                "beber",
                "sabor"
        ).contains(normalizedValue);
    }

    private String categoryMatchKey(String value) {
        return normalizeForMatching(value)
                .replaceAll("\\b(recheado|doce|salgado|integral|diet|light|zero|tradicional|especial|pronto|pronta|beber|sabor)\\b", " ")
                .replaceAll("\\s+", " ")
                .trim()
                .replaceAll("s\\b", "");
    }

    private String normalizeForMatching(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\p{Alnum}\\s]", " ")
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }

    private String simplifyCategoryName(String value) {
        if (!hasText(value)) {
            return null;
        }

        String withoutParentheses = value.replaceAll("\\s*\\([^)]*\\)", "");
        String firstCategory = withoutParentheses.split("\\s*/\\s*")[0];

        return normalizeCategoryName(firstCategory);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Market resolveMarketCoordinates(Market market) {
        if (market.getLatitude() != null && market.getLongitude() != null) {
            return market;
        }

        if (!hasText(market.getZipCode())) {
            return market;
        }

        try {
            CepLocationResponseDTO location = locationService.findByCep(market.getZipCode());

            if (Boolean.TRUE.equals(location.hasCoordinates())) {
                market.setLatitude(location.latitude());
                market.setLongitude(location.longitude());

                if (!hasText(market.getStreetAddress()) && hasText(location.streetAddress())) {
                    market.setStreetAddress(location.streetAddress());
                }

                if (!hasText(market.getNeighborhood()) && hasText(location.neighborhood())) {
                    market.setNeighborhood(location.neighborhood());
                }

                if (!hasText(market.getCity()) && hasText(location.city())) {
                    market.setCity(location.city());
                }

                if (!hasText(market.getState()) && hasText(location.state())) {
                    market.setState(location.state());
                }

                return marketRepository.save(market);
            }
        } catch (RuntimeException exception) {
            return market;
        }

        return market;
    }
}
