export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Market {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  barcode?: string;
  imageUrl: string;
  description?: string;
}

export interface Price {
  id: number;
  productId: number;
  marketId: number;
  price: number;
  isPromotion: boolean;
  validUntil?: string;
  recordedAt: string;
}

export interface PriceAlert {
  id: number;
  userId: number;
  productId: number;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface ShoppingList {
  id: number;
  userId: number;
  name: string;
  items: ShoppingListItem[];
  totalEstimated: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  checked?: boolean;
}
