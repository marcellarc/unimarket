package com.unimarket.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.ShoppingListItemRequestDTO;
import com.unimarket.backend.dto.ShoppingListItemResponseDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.entity.MarketProduct;
import com.unimarket.backend.entity.Product;
import com.unimarket.backend.entity.ShoppingList;
import com.unimarket.backend.entity.ShoppingListItem;
import com.unimarket.backend.repository.MarketProductRepository;
import com.unimarket.backend.repository.ShoppingListItemRepository;
import com.unimarket.backend.repository.ShoppingListRepository;

// classe responsável pelas regras de negócio dos itens da lista de compras
@Service
public class ShoppingListItemService {

    @Autowired
    private ShoppingListItemRepository shoppingListItemRepository;

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    // adiciona um item à lista de compras
    public ShoppingListItemResponseDTO addItem(ShoppingListItemRequestDTO dto, Long shoppingListId) {

        // verifica se a lista existe
        ShoppingList shoppingList = shoppingListRepository.findById(shoppingListId)
                .orElseThrow(() -> new RuntimeException("Lista de compras não encontrada"));

        // verifica se o vínculo mercado-produto existe
        MarketProduct marketProduct = marketProductRepository.findById(dto.getMarketProductId())
                .orElseThrow(() -> new RuntimeException("Produto do mercado não encontrado"));

        // verifica se o produto já está na lista
        if (shoppingListItemRepository.existsByShoppingListIdAndMarketProductId(shoppingListId, dto.getMarketProductId())) {
            throw new RuntimeException("Este produto já está na lista de compras");
        }

        // monta o item e salva
        ShoppingListItem item = new ShoppingListItem();
        item.setShoppingList(shoppingList);
        item.setMarketProduct(marketProduct);
        item.setQuantity(dto.getQuantity());
        shoppingListItemRepository.save(item);

        return toResponse(item);
    }

    // lista todos os itens ativos de uma lista de compras
    public List<ShoppingListItemResponseDTO> listItemsByShoppingList(Long shoppingListId) {

        // verifica se a lista existe
        shoppingListRepository.findById(shoppingListId)
                .orElseThrow(() -> new RuntimeException("Lista de compras não encontrada"));

        return shoppingListItemRepository.findByShoppingListId(shoppingListId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // realiza o soft delete de um item da lista
    public void removeItem(Long shoppingListId, Long itemId) {

        // verifica se a lista existe
        shoppingListRepository.findById(shoppingListId)
                .orElseThrow(() -> new RuntimeException("Lista de compras não encontrada"));

        // busca o item e verifica se pertence à lista
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        if (!item.getShoppingList().getId().equals(shoppingListId)) {
            throw new RuntimeException("Item não pertence a esta lista");
        }

        // @SQLDelete intercepta e executa UPDATE deleted_at em vez de DELETE
        shoppingListItemRepository.delete(item);
    }

    // converte entidade ShoppingListItem para ShoppingListItemResponseDTO
    private ShoppingListItemResponseDTO toResponse(ShoppingListItem item) {
        ShoppingListItemResponseDTO response = new ShoppingListItemResponseDTO();
        MarketProduct marketProduct = item.getMarketProduct();
        Product product = marketProduct.getProduct();
        Market market = marketProduct.getMarket();

        response.setId(item.getId());
        response.setProductName(product.getName());
        response.setMarketName(market.getName());
        response.setPrice(marketProduct.getPrice());
        response.setQuantity(item.getQuantity());
        return response;
    }
}
