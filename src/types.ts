export interface Flavor {
  id: number;
  name: string;
  price: number;
  emoji: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  badge: string;
  description: string;
  flavors: Flavor[];
}

export interface CartItem {
  key: string; // `${productId}-${flavorId}`
  productId: number;
  flavorId: number;
  productName: string;
  flavorName: string;
  emoji: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  date: string;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  complement?: string;
  payment: string;
  change: number | null;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface Customer {
  name: string;
  phone: string;
}

export type OrderStatus = 'pendente' | 'saiu' | 'chegou';
