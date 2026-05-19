export interface ShoppingList {
    id: number
    name: string
    clientName?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

export interface ShoppingListItem {
    id: number
    productName: string
    marketName: string
    price: number
    quantity: number
}

export interface ShoppingListRequest {
    name: string
}

export interface ShoppingListItemRequest {
    marketProductId: number
    quantity: number
}
