export interface ProductCreateRequest {
    productName: string
    brand: string
    description?: string
    imageUrl?: string
    categoryId: number
    barCode?: string | null
}

export interface ProductResponse {
    productId: number
    productName: string
    brand: string
    description: string
    imageUrl: string
    categoryName: string
    barCode: string
    createdAt: string
}

export interface ProductSearchParams {
    name: string
}

export interface MarketProductSearchParams {
    name?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
}

export interface MarketProductResponse {
    id: number
    marketName: string
    productName: string
    brand: string
    price: number
    stockQuantity: number
    updatedAt: string
}

export interface MarketProductUpdateRequest {
    price: number
    stockQuantity: number
}

// cria produto + associa ao mercado com preço/estoque
export interface MarketProductCreateRequest extends ProductCreateRequest {
    price?: number
    stockQuantity?: number
}