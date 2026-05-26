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

export interface CosmosProductLookup {
    productName: string
    brand?: string | null
    description?: string | null
    imageUrl?: string | null
    barCode: string
    averagePrice?: number | null
    categoryName?: string | null
    source: string
}

export interface CategoryResponse {
    id: number
    name: string
}

export interface CategoryCreateRequest {
    name: string
}

export interface ProductSearchParams {
    name: string
    page?: number
    size?: number
}

export interface MarketProductSearchParams {
    name?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
}

export interface MarketProductResponse {
    id: number
    productId: number
    marketId: number
    marketName: string
    marketLatitude?: number | null
    marketLongitude?: number | null
    productName: string
    brand: string
    categoryName?: string | null
    barCode?: string | null
    imageUrl?: string | null
    description?: string | null
    price?: number | null
    stockQuantity?: number | null
    updatedAt?: string | null
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}

export interface ProductCatalogParams {
    page?: number
    size?: number
}

export interface MarketProductUpdateRequest {
    price: number
    stockQuantity: number
}

// cria produto + associa ao mercado com preço/estoque
export interface MarketProductCreateRequest extends ProductCreateRequest {
    price: number
    stockQuantity: number
}
