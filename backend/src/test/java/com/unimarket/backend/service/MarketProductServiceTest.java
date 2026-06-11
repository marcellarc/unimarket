package com.unimarket.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.TimeZone;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.unimarket.backend.dto.CosmosProductDTO;
import com.unimarket.backend.dto.ProductRequestDTO;
import com.unimarket.backend.entity.Category;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.entity.MarketProduct;
import com.unimarket.backend.entity.Product;
import com.unimarket.backend.repository.CategoryRepository;
import com.unimarket.backend.repository.MarketProductRepository;
import com.unimarket.backend.repository.MarketRepository;
import com.unimarket.backend.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class MarketProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private MarketRepository marketRepository;

    @Mock
    private MarketProductRepository marketProductRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private PriceAlertService priceAlertService;

    @Mock
    private CosmosService cosmosService;

    @Mock
    private LocationService locationService;

    @InjectMocks
    private MarketProductService service;

    @Test
    void createProductCreatesCategoryFromCosmosWhenCategoryIdIsMissing() {
        ProductRequestDTO request = productRequest();
        request.setCategoryId(null);

        Market market = market();
        CosmosProductDTO cosmosProduct = cosmosProduct("Bebidas Não Alcoólicas - Prontas para Beber", "Refrigerantes");
        Category savedCategory = category(10L, "Refrigerantes");

        when(marketRepository.findById(1L)).thenReturn(Optional.of(market));
        when(productRepository.findByBarCode("7891910000197")).thenReturn(Optional.empty());
        when(cosmosService.findByBarCode("7891910000197")).thenReturn(cosmosProduct);
        when(categoryRepository.findByNameIgnoreCase("Refrigerantes")).thenReturn(Optional.empty());
        when(categoryRepository.findAll()).thenReturn(List.of());
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(20L);
            product.setCreatedAt(LocalDateTime.now());
            return product;
        });
        when(marketProductRepository.findAnyByMarketIdAndProductId(1L, 20L)).thenReturn(Optional.empty());
        when(marketProductRepository.save(any(MarketProduct.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.createProduct(request, 1L);

        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(categoryCaptor.capture());
        assertEquals("Refrigerantes", categoryCaptor.getValue().getName());

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertSame(savedCategory, productCaptor.getValue().getCategory());
    }

    @Test
    void createProductUsesExistingBroadCategoryBeforeCreatingSpecificCosmosCategory() {
        ProductRequestDTO request = productRequest();
        request.setCategoryId(null);
        request.setBarCode("7896071007658");

        Market market = market();
        CosmosProductDTO cosmosProduct = cosmosProduct(null, "Biscoito Recheado Doce");
        Category existingCategory = category(11L, "Biscoitos");

        when(marketRepository.findById(1L)).thenReturn(Optional.of(market));
        when(productRepository.findByBarCode("7896071007658")).thenReturn(Optional.empty());
        when(cosmosService.findByBarCode("7896071007658")).thenReturn(cosmosProduct);
        when(categoryRepository.findByNameIgnoreCase("Biscoitos")).thenReturn(Optional.of(existingCategory));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(21L);
            product.setCreatedAt(LocalDateTime.now());
            return product;
        });
        when(marketProductRepository.findAnyByMarketIdAndProductId(1L, 21L)).thenReturn(Optional.empty());
        when(marketProductRepository.save(any(MarketProduct.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.createProduct(request, 1L);

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertSame(existingCategory, productCaptor.getValue().getCategory());
    }

    @Test
    void createProductRequiresManualCategoryWhenCosmosDoesNotReturnCategory() {
        ProductRequestDTO request = productRequest();
        request.setCategoryId(null);

        when(marketRepository.findById(1L)).thenReturn(Optional.of(market()));
        when(productRepository.findByBarCode("7891910000197")).thenReturn(Optional.empty());
        when(cosmosService.findByBarCode("7891910000197")).thenReturn(cosmosProduct(null, null));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.createProduct(request, 1L));

        assertEquals("Categoria não encontrada. Selecione uma categoria manualmente.", exception.getMessage());
    }

    @Test
    void marketProductTimestampsUseApplicationTimezone() {
        ZoneId applicationZone = ZoneId.of("America/Sao_Paulo");
        TimeZone originalTimeZone = TimeZone.getDefault();
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        try {
            LocalDateTime before = LocalDateTime.now(applicationZone).minusSeconds(1);

            MarketProduct marketProduct = new MarketProduct();
            marketProduct.prePersist();

            LocalDateTime after = LocalDateTime.now(applicationZone).plusSeconds(1);

            assertFalse(marketProduct.getCreatedAt().isBefore(before));
            assertFalse(marketProduct.getCreatedAt().isAfter(after));
            assertEquals(marketProduct.getCreatedAt(), marketProduct.getUpdatedAt());

            LocalDateTime firstUpdate = marketProduct.getUpdatedAt();
            marketProduct.preUpdate();

            assertTrue(!marketProduct.getUpdatedAt().isBefore(firstUpdate));
            assertFalse(marketProduct.getUpdatedAt().isAfter(LocalDateTime.now(applicationZone).plusSeconds(1)));
        } finally {
            TimeZone.setDefault(originalTimeZone);
        }
    }

    private ProductRequestDTO productRequest() {
        ProductRequestDTO request = new ProductRequestDTO();
        request.setProductName("Acucar refinado");
        request.setBrand("Uniao");
        request.setDescription("Acucar refinado 1kg");
        request.setBarCode("7891910000197");
        request.setPrice(5.49);
        request.setStockQuantity(12);
        return request;
    }

    private Market market() {
        Market market = new Market();
        market.setId(1L);
        market.setName("Mercado Teste");
        return market;
    }

    private Category category(Long id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        return category;
    }

    private CosmosProductDTO cosmosProduct(String gpcCategoryName, String categoryName) {
        CosmosProductDTO product = new CosmosProductDTO();
        product.setDescription("ACUCAR REFINADO ESPECIAL UNIAO PACOTE 1KG");
        product.setGtin("7891910000197");

        CosmosProductDTO.BrandDTO brand = new CosmosProductDTO.BrandDTO();
        brand.setName("UNIAO");
        product.setBrand(brand);

        if (gpcCategoryName != null) {
            CosmosProductDTO.GpcDTO gpc = new CosmosProductDTO.GpcDTO();
            gpc.setCode("10000043");
            gpc.setDescription(gpcCategoryName);
            product.setGpc(gpc);
        }

        if (categoryName != null) {
            CosmosProductDTO.CategoryDTO category = new CosmosProductDTO.CategoryDTO();
            category.setId(205L);
            category.setDescription(categoryName);
            category.setParentId(65L);
            product.setCategory(category);
        }

        return product;
    }
}
