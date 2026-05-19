import { api } from '@/api/client'
import type {
    ShoppingList,
    ShoppingListItem,
    ShoppingListItemRequest,
    ShoppingListRequest,
} from '@/types/shopping-list'

export async function listShoppingLists(clientId: number) {
    const response = await api.get<ShoppingList[]>(`/clients/${clientId}/shopping-lists`)
    return response.data
}

export async function createShoppingList(clientId: number, data: ShoppingListRequest) {
    const response = await api.post<ShoppingList>(`/clients/${clientId}/shopping-lists`, data)
    return response.data
}

export async function updateShoppingList(clientId: number, listId: number, data: ShoppingListRequest) {
    const response = await api.put<ShoppingList>(`/clients/${clientId}/shopping-lists/${listId}`, data)
    return response.data
}

export async function deleteShoppingList(clientId: number, listId: number) {
    await api.delete(`/clients/${clientId}/shopping-lists/${listId}`)
}

export async function listShoppingListItems(shoppingListId: number) {
    const response = await api.get<ShoppingListItem[]>(`/shopping-lists/${shoppingListId}/items`)
    return response.data
}

export async function addShoppingListItem(shoppingListId: number, data: ShoppingListItemRequest) {
    const response = await api.post<ShoppingListItem>(`/shopping-lists/${shoppingListId}/items`, data)
    return response.data
}

export async function deleteShoppingListItem(shoppingListId: number, itemId: number) {
    await api.delete(`/shopping-lists/${shoppingListId}/items/${itemId}`)
}
