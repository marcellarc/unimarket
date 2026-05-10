package com.unimarket.backend.service.shoppingList;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.shoppingList.ShoppingListRequestDTO;
import com.unimarket.backend.dto.shoppingList.ShoppingListResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.shoppingList.ShoppingList;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.shoppingList.ShoppingListRepository;

// classe responsável pelas regras de negócio da lista de compras
@Service
public class ShoppingListService {

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private ClientRepository clientRepository;

    // cria uma nova lista de compras para o cliente
    public ShoppingListResponseDTO createShoppingList(ShoppingListRequestDTO dto, Long clientId) {

        // verifica se o cliente existe
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        ShoppingList shoppingList = new ShoppingList();
        shoppingList.setClient(client);

        // se o nome não foi informado, gera o nome automático
        if (dto.getName() == null || dto.getName().isBlank()) {
            shoppingList.setName(gerarNomeAutomatico(clientId));
        } else {
            shoppingList.setName(dto.getName());
        }

        shoppingListRepository.save(shoppingList);
        return toResponse(shoppingList);
    }

    // lista todas as listas de compras ativas de um cliente
    public List<ShoppingListResponseDTO> listShoppingListsByClient(Long clientId) {

        // verifica se o cliente existe
        clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        return shoppingListRepository.findByClientId(clientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // edita o nome de uma lista de compras
    public ShoppingListResponseDTO updateShoppingListName(Long clientId, Long id, ShoppingListRequestDTO dto) {

        // verifica se o cliente existe
        clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // busca a lista e verifica se pertence ao cliente
        ShoppingList shoppingList = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lista não encontrada"));

        if (!shoppingList.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Lista não pertence a este cliente");
        }

        // atualiza o nome da lista
        shoppingList.setName(dto.getName());
        shoppingListRepository.save(shoppingList);
        return toResponse(shoppingList);
    }

    // realiza o soft delete da lista de compras
    public void deleteShoppingList(Long clientId, Long id) {

        // verifica se o cliente existe
        clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // busca a lista e verifica se pertence ao cliente
        ShoppingList shoppingList = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lista não encontrada"));

        if (!shoppingList.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Lista não pertence a este cliente");
        }

        // @SQLDelete intercepta e executa UPDATE deleted_at em vez de DELETE
        shoppingListRepository.delete(shoppingList);
    }

    // gera o nome automático da lista baseado nos nomes padrão existentes
    private String gerarNomeAutomatico(Long clientId) {

        // busca todas as listas ativas do cliente
        List<ShoppingList> listas = shoppingListRepository.findByClientId(clientId);

        // coleta os números já usados em nomes padrão "Lista X"
        List<Integer> numerosUsados = listas.stream()
                .map(ShoppingList::getName)
                .filter(nome -> nome.matches("Lista \\d+")) // filtra apenas nomes padrão
                .map(nome -> Integer.parseInt(nome.substring(6))) // extrai o número
                .collect(Collectors.toList());

        // encontra o menor número disponível a partir de 1
        int numero = 1;
        while (numerosUsados.contains(numero)) {
            numero++;
        }

        return "Lista " + numero;
    }

    // converte entidade ShoppingList para ShoppingListResponseDTO
    private ShoppingListResponseDTO toResponse(ShoppingList shoppingList) {
        ShoppingListResponseDTO response = new ShoppingListResponseDTO();
        response.setId(shoppingList.getId());
        response.setName(shoppingList.getName());
        response.setClientName(shoppingList.getClient().getName());
        response.setCreatedAt(shoppingList.getCreatedAt());
        response.setUpdatedAt(shoppingList.getUpdatedAt());
        return response;
    }
}