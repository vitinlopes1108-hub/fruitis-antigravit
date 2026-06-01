import { Product, Order } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Elfbar BC 15K",
    badge: "15.000 PUFFS",
    description: "Pod descartável recarregável • Alta durabilidade",
    flavors: [
      { id: 101, name: "Café Ice", price: 89.90, emoji: "☕", color: "#6b4226" },
      { id: 102, name: "Hawai Popsicle", price: 89.90, emoji: "🍍", color: "#f9a825" },
    ],
  },
  {
    id: 2,
    name: "Ignite V155",
    badge: "PREMIUM",
    description: "Pod de alta performance • Sabor intenso",
    flavors: [
      { id: 201, name: "Watermelon Mix", price: 109.90, emoji: "🍉", color: "#e53935" },
    ],
  },
  {
    id: 3,
    name: "Lost Mary Dura 35K",
    badge: "35.000 PUFFS",
    description: "Ultra resistente • Maior duração do mercado",
    flavors: [
      { id: 301, name: "Grape Fruit Passion", price: 109.90, emoji: "🍇", color: "#8e24aa" },
      { id: 302, name: "Grape Ice", price: 109.90, emoji: "🍇", color: "#7b1fa2" },
      { id: 303, name: "Menthol", price: 109.90, emoji: "🌿", color: "#00897b" },
      { id: 304, name: "Strawberry Ice", price: 109.90, emoji: "🍓", color: "#e91e63" },
      { id: 305, name: "Strawberry Kiwi", price: 109.90, emoji: "🥝", color: "#43a047" },
      { id: 306, name: "Strawberry Watermelon", price: 109.90, emoji: "🍉", color: "#e53935" },
    ],
  },
  {
    id: 4,
    name: "Black Sheep 40 — 2 em 1",
    badge: "2 SABORES",
    description: "Dois sabores em um único pod • 40.000 puffs",
    flavors: [
      { id: 401, name: "Grape / Menthol", price: 149.90, emoji: "🍇", color: "#5e35b1" },
      { id: 402, name: "Strawberry Kiwi / Fresh Mint", price: 149.90, emoji: "🍓", color: "#e91e63" },
      { id: 403, name: "Blueberry Grape / Cherry Berry", price: 149.90, emoji: "🫐", color: "#3949ab" },
      { id: 404, name: "Blueberry / Sour Green Apple", price: 149.90, emoji: "🍏", color: "#558b2f" },
    ],
  },
  {
    id: 5,
    name: "Elfbar Ice King 40K",
    badge: "40.000 PUFFS",
    description: "King da gelada • Ultra refrescante",
    flavors: [
      { id: 501, name: "Dragon Strawnana", price: 139.90, emoji: "🐉", color: "#d32f2f" },
      { id: 502, name: "Watermelon Ice", price: 139.90, emoji: "🍉", color: "#43a047" },
      { id: 503, name: "Green Apple Slush", price: 139.90, emoji: "🍏", color: "#7cb342" },
      { id: 504, name: "Strawberry Watermelon", price: 139.90, emoji: "🍓", color: "#e91e63" },
      { id: 505, name: "Passion Flash", price: 139.90, emoji: "🌺", color: "#f06292" },
      { id: 506, name: "Peach Blue Slush", price: 139.90, emoji: "🍑", color: "#ff8f00" },
      { id: 507, name: "Black Mint", price: 139.90, emoji: "⬛", color: "#424242" },
      { id: 508, name: "Strawberry Ice", price: 139.90, emoji: "🍓", color: "#c62828" },
    ],
  },
  {
    id: 6,
    name: "Elfbar RAB Beats 50K",
    badge: "50.000 PUFFS",
    description: "O mais duradouro • Beats Edition",
    flavors: [
      { id: 601, name: "Icy Mint", price: 149.90, emoji: "❄️", color: "#0288d1" },
      { id: 602, name: "Sakura Grape", price: 149.90, emoji: "🌸", color: "#ad1457" },
      { id: 603, name: "Triple Berry", price: 149.90, emoji: "🫐", color: "#4527a0" },
      { id: 604, name: "Watermelon Ice", price: 149.90, emoji: "🍉", color: "#388e3c" },
    ],
  },
];

export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem('fg_products');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse products from localstorage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]) {
  localStorage.setItem('fg_products', JSON.stringify(products));
}

export function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem('fg_orders');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse orders from localstorage', e);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]) {
  localStorage.setItem('fg_orders', JSON.stringify(orders));
}
