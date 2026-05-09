import { api } from '@/api/client'
import type {
    ProductResponse,
    ProductSearchParams,
    MarketProductResponse,
    MarketProductUpdateRequest,
    MarketProductCreateRequest,
} from '@/types/product'

export async function createProduct(marketId: number, data: MarketProductCreateRequest): Promise<MarketProductResponse> {
    const response = await api.post<MarketProductResponse>(`/markets/${marketId}/products`, data)
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
