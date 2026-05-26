import { api } from '@/api/client'
import type {
    ProductResponse,
    ProductSearchParams,
    MarketProductResponse,
    MarketProductUpdateRequest,
    MarketProductCreateRequest,
    CosmosProductLookup,
    CategoryResponse,
    CategoryCreateRequest,
    PageResponse,
    ProductCatalogParams,
} from '@/types/product'

export async function createProduct(marketId: number, data: MarketProductCreateRequest): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>(`/markets/${marketId}/products`, data)
    return response.data
}

export async function lookupProductByBarcode(barCode: string) {
    const response = await api.get<CosmosProductLookup>('/products/lookup', {
        params: { barCode },
    })
    return response.data
}

export async function listCategories() {
    const response = await api.get<CategoryResponse[]>('/categories')
    return response.data
}

export async function createCategory(data: CategoryCreateRequest) {
    const response = await api.post<CategoryResponse>('/categories', data)
    return response.data
}

export async function listProducts(marketId: number) {
    const response = await api.get<MarketProductResponse[]>(`/markets/${marketId}/products`)
    return response.data
}

export async function listAllMarketProducts(params: ProductCatalogParams = {}) {
    const response = await api.get<PageResponse<MarketProductResponse>>('/products', {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 120,
        },
    })
    if (!response.data || !Array.isArray(response.data.content)) {
        throw new Error('Resposta de produtos inválida')
    }
    return response.data
}

export async function searchProductsByMarketId(marketId: number, params: ProductSearchParams) {
    const response = await api.get<MarketProductResponse[]>(`/markets/${marketId}/products/search`, {
        params,
    })
    return response.data
}

export async function searchGeneralProducts(params: ProductSearchParams) {
    const response = await api.get<PageResponse<MarketProductResponse>>('/products/search', {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 120,
            name: params.name,
        },
    })
    return response.data
}

export async function getProductById(marketId: number, productId: number) {
    const response = await api.get<MarketProductResponse>(`/markets/${marketId}/products/${productId}`)
    return response.data
}

export async function updateProductPriceAndStock(
    marketId: number,
    productId: number,
    data: MarketProductUpdateRequest,
) {
    const response = await api.put<MarketProductResponse>(
        `/markets/${marketId}/products/${productId}`,
        data,
    )
    return response.data
}

export async function deleteMarketProduct(marketId: number, productId: number) {
    await api.delete(`/markets/${marketId}/products/${productId}`)
}
