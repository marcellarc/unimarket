import { api } from '@/api/client'
import type {
    ProductResponse,
    ProductSearchParams,
    MarketProductResponse,
    MarketProductUpdateRequest,
    MarketProductCreateRequest,
    CosmosProductLookup,
    CategoryResponse,
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

export async function listProducts(marketId: number) {
    const response = await api.get<MarketProductResponse[]>(`/markets/${marketId}/products`)
    return response.data
}

export async function searchProductsByMarketId(marketId: number, params: ProductSearchParams) {
    const response = await api.get<MarketProductResponse[]>(`/markets/${marketId}/products/search`, {
        params,
    })
    return response.data
}

export async function searchGeneralProducts(params: ProductSearchParams) {
    const response = await api.get<ProductResponse[]>('/products/search', {
        params,
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
