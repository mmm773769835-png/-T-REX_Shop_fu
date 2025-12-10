export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  images: string[];
  categoryId: string;
  subCategoryId?: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  attributes: Record<string, string>;
  variants?: ProductVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  addresses: ShippingAddress[];
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
}