import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_PRODUCTS } from './data';
import { Product, CartItem, Order, Customer, OrderStatus } from './types';
import {
  fetchProducts,
  fetchOrders,
  fetchOrdersByPhone,
  upsertProduct,
  deleteProduct as dbDeleteProduct,
  insertOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  deleteOrder as dbDeleteOrder,
  decrementStock,
  logAudit,
  logStockAdjust,
  fetchStockLog,
  subscribeToNewOrders,
  subscribeToOrderStatus,
  subscribeToProductChanges,
  fetchCustomerRanking,
  incrementCustomerRanking,
  markRewardUsed,
  calcRanking,
  fetchStoreConfig,
  saveStoreConfig,
  checkIsStoreOpen,
  type CustomerRanking,
  type StoreConfig,
} from './supabase';
import { 
  ShoppingCart, 
  Sun, 
  Moon, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Settings, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  Truck, 
  Bell, 
  Store,
  Compass,
  FileText,
  Smartphone,
  Copy,
  ExternalLink,
  BarChart2,
  Package,
  RefreshCw,
  History,
  TrendingUp,
  Users,
  Award,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Trophy,
  Star,
  Gift,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import LOGO_IMAGE_URI from './assets/images/regenerated_image_1780345884965.jpg';

// Default WhatsApp Number & Delivery Fee
const INITIAL_WHATSAPP_NUMBER = "5534996921533";
const DELIVERY_FEE = 5.00;
const ADMIN_USER = "admin";
const ADMIN_PASS = "frutinhas2024";

// Logo SVG URL placeholder removed, imported above instead

// Global Helpers
export const fmt = (val: number) => {
  return "R$ " + val.toFixed(2).replace('.', ',');
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// ── BRAND LOGO COMPONENT ──────────────────────────────────────────────────────
export const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src={LOGO_IMAGE_URI}
        alt="Frutinhas Geladas"
        className="rounded-full object-cover shadow-lg shadow-purple-500/20"
        style={{ width: size, height: size }}
      />
      <div>
        <div className="font-brand leading-none tracking-wide text-purple-400 font-extrabold" style={{ fontSize: size * 0.52 }}>
          Frutinhas
        </div>
        <div className="font-brand leading-tight tracking-[0.15em] text-xs font-black" style={{ fontSize: size * 0.31, color: '#C542F5' }}>
          GELADAS ❄️
        </div>
      </div>
    </div>
  );
};

// ── CUSTOM INPUT COMPONENT ────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  darkMode?: boolean;
  type?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Input = ({ label, darkMode = true, type = "text", ...p }: InputProps) => {
  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 text-left">
          {label}
        </label>
      )}
      <input
        type={type}
        {...p}
        className={`w-full p-2.5 px-3.5 rounded-xl outline-none text-sm transition-all border ${
          darkMode 
            ? 'bg-white/5 border-purple-500/15 text-white focus:border-purple-500/40 focus:bg-white/10' 
            : 'bg-purple-100/10 border-purple-950/15 text-[#1a0030] focus:border-purple-500 focus:bg-white'
        }`}
      />
    </div>
  );
};

// ── CUSTOM SELECT COMPONENT ───────────────────────────────────────────────────
interface SelProps {
  label?: string;
  darkMode?: boolean;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
}

export const Sel = ({ label, darkMode = true, children, ...p }: SelProps) => {
  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 text-left">
          {label}
        </label>
      )}
      <select
        {...p}
        className={`w-full p-2.5 px-3.5 rounded-xl outline-none text-sm border ${
          darkMode 
            ? 'bg-zinc-900 border-purple-500/15 text-white' 
            : 'bg-white border-purple-950/15 text-[#1a0030]'
        }`}
      >
        {children}
      </select>
    </div>
  );
};

// ── CUSTOM BUTTON COMPONENT ───────────────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'green' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Btn = ({ children, variant = 'primary', size = 'md', full, onClick, disabled, style = {} }: BtnProps) => {
  const padding = size === 'sm' ? 'py-1.5 px-3.5' : size === 'lg' ? 'py-3 px-6' : 'py-2 px-5';
  const fontSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  const baseClasses = `font-bold rounded-xl active:scale-98 transition-all tracking-wide text-center duration-150 ${padding} ${fontSize} ${
    full ? 'w-full' : ''
  } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

  const themeClasses = {
    primary: 'bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg shadow-purple-500/15 hover:from-purple-600 hover:to-purple-400',
    secondary: 'bg-purple-500/10 text-purple-400 border border-purple-500/25 hover:bg-purple-500/15',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15',
    green: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/15 hover:from-emerald-500 hover:to-emerald-400',
    ghost: 'bg-transparent text-purple-400 border border-transparent hover:bg-purple-500/5',
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${themeClasses[variant]}`}
      style={style}
    >
      {children}
    </button>
  );
};

// ── CUSTOM NOTIFICATION SWITCH COMPONENT ──────────────────────────────────────
interface NotifToggleProps {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
  darkMode?: boolean;
}

export const NotifToggle = ({ label, desc, enabled, onToggle, darkMode = true }: NotifToggleProps) => {
  return (
    <div className={`flex justify-between items-center py-3.5 border-b ${darkMode ? 'border-purple-500/10' : 'border-purple-950/5'}`}>
      <div className="flex-1 pr-3 text-left">
        <p className="text-[13px] font-bold leading-snug">{label}</p>
        <p className="text-[11px] opacity-60 mt-1 leading-snug">{desc}</p>
      </div>
      <div 
        onClick={onToggle} 
        className={`w-12 h-6.5 rounded-full relative cursor-pointer transition-colors duration-200 flex-shrink-0 ${
          enabled ? 'bg-purple-500' : 'bg-white/10'
        }`}
      >
        <div 
          className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200"
          style={{ left: enabled ? '25px' : '2px' }}
        />
      </div>
    </div>
  );
};

// ── CUSTOMER LOGIN COMPONENT ──────────────────────────────────────────────────
interface LoginFormProps {
  darkMode: boolean;
  onLogin: (name: string, phone: string, saveSession: boolean) => void;
  onGoAdmin: () => void;
}

export function LoginForm({ darkMode, onLogin, onGoAdmin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saveSession, setSaveSession] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onLogin(name, phone, saveSession);
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border transition-all ${
      darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-white border-purple-950/10 shadow-lg'
    }`}>
      <h3 className="text-xl font-brand mb-5 text-center">Boas-vindas à nossa loja!</h3>
      
      <div className="space-y-4 mb-6">
        <Input 
          label="Seu Nome" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ex: Pedro Henrique" 
          darkMode={darkMode}
          required 
        />

        <Input 
          label="Seu WhatsApp" 
          value={phone} 
          type="tel"
          onChange={(e) => setPhone(e.target.value)} 
          placeholder="Ex: (34) 99692-1533" 
          darkMode={darkMode}
          required 
        />

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={saveSession} 
            onChange={() => setSaveSession(!saveSession)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
            saveSession ? 'bg-purple-500 border-purple-500 text-white' : 'border-purple-400/40 bg-transparent'
          }`}>
            {saveSession && <Check size={12} strokeWidth={3} />}
          </div>
          <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-[#1a0030]/65'}`}>
            Manter conectado neste dispositivo
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!name.trim() || !phone.trim()}
        className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-lg shadow-purple-500/20 active:scale-98 transition-all disabled:opacity-40"
      >
        Entrar na Loja 🛒
      </button>

      <div className="mt-4 text-center">
        <button 
          type="button"
          onClick={onGoAdmin}
          className="text-xs text-purple-500 hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <Settings size={12} /> Painel Administrativo
        </button>
      </div>
    </form>
  );
}

// ── ADMIN LOGIN FORM COMPONENT ─────────────────────────────────────────────────
interface AdminLoginFormProps {
  darkMode: boolean;
  onSuccess: (staySignedIn: boolean) => void;
  onBack: () => void;
}

export function AdminLoginForm({ darkMode, onSuccess, onBack }: AdminLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      onSuccess(staySignedIn);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border transition-all ${
      darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-white border-purple-950/10 shadow-lg'
    }`}>
      <div className="space-y-4 mb-5">
        <Input 
          label="Usuário" 
          value={username} 
          onChange={(e) => { setUsername(e.target.value); setError(''); }} 
          placeholder="admin" 
          darkMode={darkMode}
          required 
        />

        <Input 
          label="Senha" 
          value={password} 
          type="password"
          onChange={(e) => { setPassword(e.target.value); setError(''); }} 
          placeholder="••••••••" 
          darkMode={darkMode}
          required 
        />

        {error && (
          <div className="text-red-500 text-xs flex items-center gap-1.5 font-medium">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={staySignedIn} 
            onChange={() => setStaySignedIn(!staySignedIn)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
            staySignedIn ? 'bg-purple-500 border-purple-500 text-white' : 'border-purple-400/40 bg-transparent'
          }`}>
            {staySignedIn && <Check size={12} strokeWidth={3} />}
          </div>
          <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-[#1a0030]/65'}`}>
            Permanecer logado como administrador
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-lg shadow-purple-500/20 active:scale-98 transition-all"
        >
          Entrar no Painel 🔑
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs border transition-all ${
            darkMode 
              ? 'bg-transparent border-purple-500/30 text-purple-400 hover:bg-white/5' 
              : 'bg-transparent border-purple-950/15 text-purple-800 hover:bg-purple-50/20'
          }`}
        >
          ← Voltar ao Início
        </button>
      </div>
    </form>
  );
}

// ── CATALOG VIEW COMPONENT ────────────────────────────────────────────────────
interface CatalogViewProps {
  darkMode: boolean;
  customer: Customer;
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenCart: () => void;
}

export function CatalogView({ darkMode, customer, products, cart, setCart, onOpenCart }: CatalogViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const cartTotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const filterProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.flavors.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = (product: Product, flavor: any) => {
    const key = `${product.id}-${flavor.id}`;
    const price = flavor.price;

    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item => 
          item.key === key ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [
        ...prev, 
        {
          key,
          productId: product.id,
          flavorId: flavor.id,
          productName: product.name,
          flavorName: flavor.name,
          emoji: flavor.emoji,
          price,
          qty: quantity
        }
      ];
    });

    setSelectedProduct(null);
    setSelectedFlavor(null);
    setQuantity(1);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Banner / User Greetings */}
      <div className="p-4 flex-shrink-0">
        <div className={`p-4 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[90px] border ${
          darkMode 
            ? 'bg-gradient-to-br from-purple-950/20 to-purple-900/10 border-purple-500/10' 
            : 'bg-gradient-to-br from-purple-100/50 to-purple-50/20 border-purple-800/10'
        }`}>
          <div className="absolute top-1 right-2 opacity-10 font-bold text-6xl">VAPE</div>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles size={12} className="animate-pulse" /> Sabores Incríveis
          </span>
          <h2 className="text-lg font-bold leading-normal">
            Fala, <span className="text-purple-500">{customer.name.split(' ')[0]}</span>! 🍓
          </h2>
          <p className={`text-[11px] mt-1 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/65'}`}>
            Selecione o modelo e explore as opções de sabor:
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-2 flex-shrink-0">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔎 Buscar modelo ou sabor..."
          className={`w-full p-3 px-4 rounded-xl outline-none text-sm transition-all border ${
            darkMode 
              ? 'bg-white/5 border-purple-500/10 text-white focus:border-purple-500/20 shadow-inner' 
              : 'bg-purple-100/10 border-purple-950/10 text-[#1a0030] focus:border-purple-500'
          }`}
        />
      </div>

      {/* Scrollable Catalogs */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {filterProducts.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Compass size={40} className="mx-auto mb-2 text-purple-400 animate-pulse" />
            <p className="text-sm font-semibold">Nenhum produto encontrado</p>
          </div>
        ) : (
          filterProducts.map((p) => {
            return (
              <div 
                key={p.id} 
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  darkMode ? 'bg-white/5 border-purple-500/10 hover:border-purple-500/20' : 'bg-white border-purple-950/10 shadow-sm'
                }`}
              >
                {/* Product Meta */}
                <div className="flex justify-between items-start mb-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-brand text-lg tracking-wide">{p.name}</h3>
                      {p.badge && (
                        <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-1 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/65'}`}>{p.description}</p>
                  </div>
                </div>

                <div className="text-xs font-black uppercase text-purple-400 tracking-wider mb-2.5 text-left">Escolha o Sabor:</div>
                
                {/* Flavors Grid — bigger tap targets */}
                <div className="grid grid-cols-2 gap-2.5">
                  {p.flavors.map((flavor) => {
                    const isSelected = selectedProduct?.id === p.id && selectedFlavor?.id === flavor.id;
                    const outOfStock = flavor.stock !== null && flavor.stock === 0;
                    const lowStock   = flavor.stock !== null && flavor.stock > 0 && flavor.stock <= 3;
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          if (outOfStock) return;
                          setSelectedProduct(p);
                          setSelectedFlavor(flavor);
                          setQuantity(1);
                        }}
                        className={`p-3 min-h-[80px] rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden active:scale-95 ${
                          outOfStock
                            ? 'opacity-50 cursor-not-allowed ' + (darkMode ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-gray-200')
                            : isSelected 
                              ? 'bg-purple-500/20 border-purple-500 text-white shadow-md shadow-purple-500/20' 
                              : darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-purple-50/15 border-purple-900/10 hover:bg-purple-50/30'
                        }`}
                      >
                        {outOfStock && (
                          <div className="absolute top-1.5 right-1.5 text-[8px] font-black bg-red-500/90 text-white px-1.5 py-0.5 rounded-full">
                            ESGOTADO
                          </div>
                        )}
                        {lowStock && !outOfStock && (
                          <div className="absolute top-1.5 right-1.5 text-[8px] font-black bg-amber-500/90 text-white px-1.5 py-0.5 rounded-full">
                            ⚠️ {flavor.stock} un.
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 select-none">
                          <span className="text-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{flavor.emoji}</span>
                          <span className="text-xs font-bold leading-snug text-left">{flavor.name}</span>
                        </div>
                        <div className={`text-xs font-black text-left ${ outOfStock ? 'text-gray-400' : 'text-purple-400'}`}>
                          {outOfStock ? 'Indisponível' : flavor.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Quantity & Cart Action if Selected */}
                {selectedProduct?.id === p.id && selectedFlavor && (
                  <div className={`mt-3 p-4 rounded-xl border flex flex-col space-y-3 ${
                    darkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50/50 border-purple-500/10'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold flex items-center gap-1.5 text-sm">
                        {selectedFlavor.emoji} {selectedFlavor.name} 
                      </span>
                      <span className="font-black text-purple-500 text-base">
                        {fmt(selectedFlavor.price * quantity)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls — large touch targets */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center active:scale-90 transition-all text-purple-500 border border-purple-500/10"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="w-8 text-center text-base font-black">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-10 h-10 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center active:scale-90 transition-all text-purple-500 border border-purple-500/10"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p, selectedFlavor)}
                        className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                      >
                        + Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── CART VIEW COMPONENT ───────────────────────────────────────────────────────
interface CartViewProps {
  darkMode: boolean;
  customer: Customer;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onBack: () => void;
  onCheckout: (order: Order) => void;
  isStoreOpen: boolean;
  storeConfig: StoreConfig;
}

export function CartView({ darkMode, customer, cart, setCart, onBack, onCheckout, isStoreOpen, storeConfig }: CartViewProps) {
  const [step, setStep] = useState<'cart' | 'address' | 'review'>('cart');
  const [streetAddress, setStreetAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Tupaciguara - MG');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [changeFor, setChangeFor] = useState('');

  const updateQty = (key: string, delta: number) => {
    setCart(prev => 
      prev.map(item => 
        item.key === key ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (key: string) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const total = subtotal + DELIVERY_FEE;

  const handleFinalize = () => {
    if (!streetAddress || !neighborhood || !city) return;
    
    const order: Order = {
      id: Date.now(),
      date: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      name: customer.name,
      phone: customer.phone,
      address: streetAddress,
      neighborhood,
      city,
      complement: complement || undefined,
      payment: paymentMethod,
      change: paymentMethod === 'Dinheiro' && changeFor ? parseFloat(changeFor) : null,
      items: cart,
      subtotal,
      total
    };

    onCheckout(order);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${
        darkMode ? 'bg-[#0c0118]/90 border-purple-500/10' : 'bg-white/90 border-[#1a0030]/10'
      }`}>
        <button onClick={onBack} className="p-2 text-purple-400 hover:text-purple-500 flex items-center">
          <span className="text-xl mr-1">←</span> Voltar
        </button>
        <h2 className="text-md font-brand tracking-wider text-purple-400">
          {step === 'cart' ? '🛒 Seu Carrinho' : step === 'address' ? '📍 Endereço' : '📝 Confirmar'}
        </h2>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {step === 'cart' && (
          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-20 opacity-55 space-y-2">
                <ShoppingCart size={40} className="mx-auto text-purple-400" />
                <p className="text-sm font-semibold">Seu carrinho está vazio</p>
                <button onClick={onBack} className="text-xs text-purple-500 underline font-bold">Adicionar produtos</button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.key}
                  className={`p-3 rounded-2xl border flex items-center gap-3 ${
                    darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                  }`}
                >
                  <span className="text-3xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>{item.emoji}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`font-bold text-xs truncate leading-normal ${darkMode ? 'text-white' : 'text-[#1a0030]'}`}>{item.productName}</p>
                    <p className="text-[11px] text-purple-400 font-bold mt-0.5 truncate">{item.flavorName}</p>
                    <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                      {fmt(item.price)} un.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => updateQty(item.key, -1)}
                      className="w-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center font-bold text-xs text-purple-500"
                    >
                      <Minus size={11} strokeWidth={2.5} />
                    </button>
                    <span className="w-4 text-center text-xs font-black">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.key, 1)}
                      className="w-6 h-6 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-500"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => removeItem(item.key)}
                      className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center font-bold text-xs text-red-500 ml-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <div className={`p-4 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
              }`}>
                <div className="space-y-2 border-b border-purple-500/10 pb-3 mb-3 text-xs opacity-85 text-left">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1"><Truck size={12} /> Frete Fixo</span>
                    <span>{fmt(DELIVERY_FEE)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-left">
                  <span className="font-bold text-sm">Total do Pedido</span>
                  <span className="font-brand text-xl text-purple-500">{fmt(total)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'address' && (
          <div className={`p-4 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
          }`}>
            <h3 className="font-brand text-lg text-purple-500 mb-4 flex items-center gap-1.5 justify-start text-left">
              <MapPin size={18} /> Detalhes da Entrega
            </h3>

            <Input label="Rua / Avenida e número" placeholder="Ex: Rua das Flores, 123" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} darkMode={darkMode} />
            <Input label="Bairro" placeholder="Ex: Centro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} darkMode={darkMode} />
            <Input label="Cidade / Estado" placeholder="Ex: Tupaciguara - MG" value={city} onChange={(e) => setCity(e.target.value)} darkMode={darkMode} />
            <Input label="Complemento / Referência (opcional)" placeholder="Ex: Apto 204, Proximo ao mercado" value={complement} onChange={(e) => setComplement(e.target.value)} darkMode={darkMode} />

            <Sel label="Forma de Pagamento" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} darkMode={darkMode}>
              <option value="PIX">Pix (Rápido e Prático)</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Dinheiro">Dinheiro vivo</option>
            </Sel>

            {paymentMethod === "Dinheiro" && (
              <div className="animate-fade-in">
                <Input label="Precisa de troco?" type="number" placeholder="Troco para quanto?" value={changeFor} onChange={(e) => setChangeFor(e.target.value)} darkMode={darkMode} />
              </div>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border text-left ${
              darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
            }`}>
              <h3 className="font-brand text-base text-purple-500 mb-3">Resumo dos Itens</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.key} className="flex justify-between items-center text-xs">
                    <span className="opacity-80 truncate pr-4">{item.emoji} {item.productName} ({item.flavorName}) <strong className="text-purple-400">x{item.qty}</strong></span>
                    <span className="font-bold flex-shrink-0">{fmt(item.qty * item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-purple-500/10 mt-3 pt-3 text-xs space-y-1 opacity-75">
                <div className="flex justify-between"><span>Produtos:</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span>Entrega (Frete fixo):</span><span>{fmt(DELIVERY_FEE)}</span></div>
              </div>
              <div className="flex justify-between items-center border-t border-purple-500/10 mt-3 pt-3">
                <span className="font-bold text-sm">Total do Pedido</span>
                <span className="font-brand text-lg text-purple-500">{fmt(total)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-left ${
              darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
            }`}>
              <h3 className="font-brand text-base text-purple-500 mb-2">Destino</h3>
              <p className="text-sm font-bold">{streetAddress}, {neighborhood}</p>
              <p className="text-xs opacity-65 mt-0.5">{city}</p>
              {complement && <p className="text-xs text-purple-400 mt-1">🏠 Obs: {complement}</p>}
              <p className="text-xs font-bold text-purple-500 mt-3">Forma de Pagamento: {paymentMethod}</p>
              {paymentMethod === 'Dinheiro' && changeFor && (
                <p className="text-xs opacity-75 mt-1">Troco para: {fmt(parseFloat(changeFor))}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 border-t flex-shrink-0 backdrop-blur-md">
          {step === 'cart' && (
            <button 
              onClick={() => setStep('address')}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-lg active:scale-98 transition-all"
            >
              Confirmar Itens → Endereço
            </button>
          )}

          {step === 'address' && (
            <button 
              onClick={() => setStep('review')}
              disabled={!streetAddress || !neighborhood || !city}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-lg active:scale-98 transition-all disabled:opacity-40"
            >
              Ir para Confirmação →
            </button>
          )}

          {step === 'review' && (
            <div className="space-y-2">
              {!isStoreOpen && (
                <div className={`p-3 rounded-xl border text-center ${
                  darkMode ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-xs font-black text-red-400">
                    🔴 Loja fechada no momento
                  </p>
                  <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/55' : 'text-[#1a0030]/55'}`}>
                    Atendemos das <strong>{storeConfig.abertura}</strong> às <strong>{storeConfig.fechamento}</strong>. Volte mais tarde!
                  </p>
                </div>
              )}
              <button 
                onClick={handleFinalize}
                disabled={!isStoreOpen}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg active:scale-98 transition-all ${
                  isStoreOpen
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
                    : 'bg-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {isStoreOpen ? '✅ Finalizar & Enviar via WhatsApp' : '🔒 Loja Fechada'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ORDER SUCCESS TRACKING COMPONENT ──────────────────────────────────────────
interface OrderSuccessProps {
  darkMode: boolean;
  order: Order;
  orderStatus: OrderStatus;
  onActionNew: () => void;
  onViewHistory?: () => void;
}

export function OrderSuccess({ darkMode, order, orderStatus, onActionNew, onViewHistory }: OrderSuccessProps) {
  const steps = [
    { key: "pendente", label: "Pedido recebido via WhatsApp", icon: "📋", s: "Recebido" },
    { key: "saiu", label: "Saiu para entrega", icon: "🛵", s: "A caminho" },
    { key: "chegou", label: "Entregador na porta!", icon: "🔔", s: "Disponibilizado" },
  ];

  const currIndex = steps.findIndex(s => s.key === orderStatus);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <Logo size={40} />

      <div className={`mt-6 p-5 rounded-2xl border w-full max-w-sm text-left ${
        darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-white border-purple-950/10 shadow-lg'
      }`}>
        <h2 className="text-xl font-brand text-emerald-500 text-center mb-1">Pedido Registrado!</h2>
        <p className={`text-xs text-center mb-5 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/65'}`}>
          Seu pedido foi formatado e enviado pro nosso suporte de atendimento.
        </p>

        {/* Order Card Info */}
        <div className={`p-4 rounded-xl border mb-5 ${
          darkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/10'
        }`}>
          <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
            <span>Pedido #{String(order.id).slice(-6)}</span>
            <span>{order.date.split(',')[1]?.trim()}</span>
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-1.5">{fmt(order.total)}</p>
          <p className="text-xs opacity-75 mt-0.5">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'} · {order.payment}</p>
        </div>

        {/* Real-time Order Tracking Status Feed */}
        <h3 className="font-brand text-sm text-purple-400 mb-3 uppercase tracking-wider">🗺️ Status da entrega</h3>
        <div className="space-y-2.5">
          {steps.map((st, idx) => {
            const isCompleted = idx <= currIndex;
            const isCurrent = idx === currIndex;
            return (
              <div 
                key={st.key}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                  isCurrent 
                    ? `bg-purple-500/10 border-purple-500` 
                    : isCompleted 
                      ? 'bg-transparent border-purple-500/10' 
                      : 'opacity-35 border-transparent'
                }`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                    isCompleted ? 'bg-purple-500 text-white' : 'bg-transparent border border-white/20 text-white/50'
                  }`}
                >
                  {isCompleted ? st.icon : idx + 1}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold ${isCompleted ? 'text-white' : 'text-white/50'}`}>{st.label}</p>
                  {isCurrent && <p className="text-[10px] text-purple-400 font-bold mt-0.5">Etapa Atual</p>}
                </div>
                {isCurrent && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={onActionNew}
        className="mt-6 w-full max-w-sm py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-md active:scale-98 transition-all"
      >
        🛍️ Voltar ao Cardápio / Comprar Mais
      </button>
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className={`mt-3 w-full max-w-sm py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
            darkMode ? 'border-purple-500/30 text-purple-400 bg-white/5' : 'border-purple-500/20 text-purple-700 bg-purple-50/30'
          }`}
        >
          📋 Ver Meus Pedidos
        </button>
      )}
    </div>
  );
}

// ── CUSTOMER HISTORY COMPONENT ───────────────────────────────────────────────
interface CustomerHistoryProps {
  darkMode: boolean;
  customer: Customer;
  onBack: () => void;
  onRepeatOrder: (items: CartItem[]) => void;
}

export function CustomerHistory({ darkMode, customer, onBack, onRepeatOrder }: CustomerHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchOrdersByPhone(customer.phone).then((data) => {
      setOrders(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [customer.phone]);

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'chegou': return { label: 'Entregue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: '✅' };
      case 'saiu':   return { label: 'A caminho', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '🛵' };
      default:        return { label: 'Aguardando', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: '📋' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-3 flex-shrink-0 ${
        darkMode ? 'bg-[#0c0118]/95 border-purple-500/10' : 'bg-white/95 border-[#1a0030]/10'
      } backdrop-blur-md`}>
        <button onClick={onBack} className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <div className="flex-1">
          <h2 className="font-brand text-lg tracking-wide text-purple-400">Meus Pedidos</h2>
          <p className={`text-[11px] ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>{customer.name}</p>
        </div>
        <div className={`p-2 rounded-xl border ${
          darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-purple-50 border-purple-200'
        }`}>
          <History size={16} className="text-purple-400" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-3">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-purple-400 font-semibold animate-pulse">Buscando seus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
              darkMode ? 'bg-white/5' : 'bg-purple-50'
            }`}>📦</div>
            <h3 className="font-bold text-base">Nenhum pedido encontrado</h3>
            <p className={`text-xs px-6 leading-relaxed ${
              darkMode ? 'text-white/50' : 'text-[#1a0030]/50'
            }`}>
              Você ainda não fez nenhum pedido com o número <strong>{customer.phone}</strong>. Que tal explorar nosso catálogo?
            </p>
            <button
              onClick={onBack}
              className="mt-2 py-2.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 shadow-md active:scale-98 transition-all"
            >
              🛍️ Explorar Catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className={`p-4 rounded-2xl border flex gap-4 ${
              darkMode ? 'bg-purple-500/5 border-purple-500/15' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Pedidos</p>
                <p className="text-2xl font-black mt-0.5">{orders.length}</p>
              </div>
              <div className={`w-px ${ darkMode ? 'bg-purple-500/15' : 'bg-purple-200' }`} />
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Total Gasto</p>
                <p className="text-lg font-black text-purple-400 mt-0.5">{fmt(orders.reduce((a, o) => a + o.total, 0))}</p>
              </div>
              <div className={`w-px ${ darkMode ? 'bg-purple-500/15' : 'bg-purple-200' }`} />
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Entregues</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{orders.filter(o => o.status === 'chegou').length}</p>
              </div>
            </div>

            {/* Orders list */}
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const isExpanded = expandedId === order.id;

              return (
                <motion.div
                  key={order.id}
                  layout
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                  }`}
                >
                  {/* Order header — always visible */}
                  <button
                    className="w-full p-4 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                          Pedido #{String(order.id).slice(-6)}
                        </span>
                        <p className={`text-[11px] mt-0.5 ${ darkMode ? 'text-white/50' : 'text-[#1a0030]/50' }`}>
                          {order.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span className="font-black text-sm text-purple-400">{fmt(order.total)}</span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <span key={item.key} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-white/8 text-white/70' : 'bg-purple-50 text-[#1a0030]/70'
                        }`}>
                          {item.emoji} {item.flavorName} ×{item.qty}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-600'
                        }`}>
                          +{order.items.length - 3} mais
                        </span>
                      )}
                    </div>

                    <div className={`mt-2 text-[10px] flex items-center justify-end gap-1 ${
                      darkMode ? 'text-white/30' : 'text-[#1a0030]/30'
                    }`}>
                      {isExpanded ? 'Recolher ▲' : 'Ver detalhes ▼'}
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-t ${ darkMode ? 'border-purple-500/10' : 'border-purple-100' }`}
                      >
                        <div className="p-4 space-y-4">
                          {/* Status tracker */}
                          <div>
                            <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider mb-3">Status da Entrega</p>
                            <div className="space-y-2">
                              {[
                                { key: 'pendente', label: 'Pedido recebido', icon: '📋' },
                                { key: 'saiu', label: 'Saiu para entrega', icon: '🛵' },
                                { key: 'chegou', label: 'Entregue com sucesso', icon: '✅' },
                              ].map((step, idx) => {
                                const stepIndex = ['pendente', 'saiu', 'chegou'].indexOf(order.status || 'pendente');
                                const isCompleted = idx <= stepIndex;
                                const isCurrent = idx === stepIndex;
                                return (
                                  <div key={step.key} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                                    isCurrent
                                      ? 'bg-purple-500/10 border border-purple-500/30'
                                      : isCompleted
                                        ? darkMode ? 'bg-white/3' : 'bg-purple-50/50'
                                        : 'opacity-30'
                                  }`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                      isCompleted ? 'bg-purple-500 text-white' : darkMode ? 'bg-white/10' : 'bg-purple-100'
                                    }`}>
                                      {isCompleted ? step.icon : idx + 1}
                                    </div>
                                    <span className={`text-xs font-bold flex-1 ${
                                      isCompleted ? '' : darkMode ? 'text-white/40' : 'text-[#1a0030]/40'
                                    }`}>{step.label}</span>
                                    {isCurrent && (
                                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Items breakdown */}
                          <div>
                            <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider mb-2">Itens do Pedido</p>
                            <div className={`rounded-xl border divide-y ${
                              darkMode ? 'border-purple-500/10 divide-purple-500/10' : 'border-purple-100 divide-purple-100'
                            }`}>
                              {order.items.map((item) => (
                                <div key={item.key} className="flex justify-between items-center px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{item.emoji}</span>
                                    <div>
                                      <p className="text-[11px] font-bold leading-snug">{item.productName}</p>
                                      <p className="text-[10px] text-purple-400">{item.flavorName}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black">{fmt(item.qty * item.price)}</p>
                                    <p className={`text-[10px] ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40' }`}>×{item.qty}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery address */}
                          <div className={`p-3 rounded-xl border text-left ${
                            darkMode ? 'bg-white/3 border-purple-500/10' : 'bg-purple-50/30 border-purple-100'
                          }`}>
                            <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider mb-1.5">📍 Entrega</p>
                            <p className="text-xs font-bold">{order.address}, {order.neighborhood}</p>
                            <p className={`text-[10px] mt-0.5 ${ darkMode ? 'text-white/50' : 'text-[#1a0030]/50' }`}>{order.city}</p>
                            {order.complement && (
                              <p className="text-[10px] text-purple-400 mt-0.5">🏠 {order.complement}</p>
                            )}
                            <p className="text-[10px] font-bold text-purple-400 mt-2">💳 {order.payment}</p>
                          </div>

                          {/* Total + Repeat */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-[10px] ${ darkMode ? 'text-white/50' : 'text-[#1a0030]/50' }`}>Total pago</p>
                              <p className="font-brand text-xl text-purple-400">{fmt(order.total)}</p>
                            </div>
                            <button
                              onClick={() => onRepeatOrder(order.items)}
                              className="py-2.5 px-5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-purple-700 to-purple-500 shadow-md active:scale-98 transition-all flex items-center gap-1.5"
                            >
                              <RefreshCw size={12} /> Repetir Pedido
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ── RANKING VIEW COMPONENT ────────────────────────────────────────────────────
interface RankingViewProps {
  darkMode: boolean;
  customer: Customer;
  onBack: () => void;
}

export function RankingView({ darkMode, customer, onBack }: RankingViewProps) {
  const [ranking, setRanking] = useState<CustomerRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewardClaiming, setRewardClaiming] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [levelUpAnim, setLevelUpAnim] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCustomerRanking(customer.phone).then((data) => {
      setRanking(data);
      setLoading(false);
    });
  }, [customer.phone]);

  const nivel = ranking?.nivel_atual ?? 0;
  const comprasNoCiclo = ranking?.compras_no_ciclo ?? 0;
  const totalCompras = ranking?.total_compras ?? 0;
  const recompensaDisponivel = ranking?.recompensa_disponivel ?? false;
  const faltam = nivel < 5 ? 5 - comprasNoCiclo : 0;
  const progresso = nivel === 0 ? 0 : (comprasNoCiclo / 5) * 100;

  const LEVEL_ICONS = ['🌱', '🥉', '🥈', '🥇', '💎', '🏆'];
  const LEVEL_NAMES = ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Diamante', 'Campeão'];
  const LEVEL_COLORS = [
    'from-zinc-600 to-zinc-500',
    'from-amber-700 to-amber-500',
    'from-slate-500 to-slate-400',
    'from-yellow-600 to-yellow-400',
    'from-cyan-600 to-cyan-400',
    'from-purple-700 to-purple-400',
  ];
  const LEVEL_GLOW = [
    'shadow-zinc-500/20',
    'shadow-amber-500/30',
    'shadow-slate-400/30',
    'shadow-yellow-400/40',
    'shadow-cyan-400/40',
    'shadow-purple-500/40',
  ];

  const handleClaimReward = async () => {
    setRewardClaiming(true);
    await markRewardUsed(customer.phone);
    setRewardClaimed(true);
    setRanking(prev => prev ? { ...prev, recompensa_disponivel: false } : prev);
    setRewardClaiming(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-3 flex-shrink-0 ${
        darkMode ? 'bg-[#0c0118]/95 border-purple-500/10' : 'bg-white/95 border-[#1a0030]/10'
      } backdrop-blur-md`}>
        <button onClick={onBack} className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <div className="flex-1">
          <h2 className="font-brand text-lg tracking-wide text-amber-400">🏆 Programa de Fidelidade</h2>
          <p className={`text-[11px] ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>{customer.name}</p>
        </div>
        <div className={`p-2 rounded-xl border ${darkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-300'}`}>
          <Trophy size={16} className="text-amber-400" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-amber-400 font-semibold animate-pulse">Carregando seu ranking...</p>
          </div>
        ) : (
          <>
            {/* Hero Level Card */}
            <div className={`relative overflow-hidden rounded-3xl p-6 text-center shadow-2xl ${LEVEL_GLOW[nivel]} bg-gradient-to-br ${LEVEL_COLORS[nivel]}`}>
              <div className="absolute inset-0 opacity-10 text-[120px] font-black flex items-center justify-center select-none pointer-events-none">
                {LEVEL_ICONS[nivel]}
              </div>
              {/* Level badge */}
              <div className="relative z-10">
                <div className="text-6xl mb-3 drop-shadow-xl">{LEVEL_ICONS[nivel]}</div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full mb-2">
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Nível {nivel}</span>
                </div>
                <h3 className="font-brand text-3xl text-white font-black drop-shadow">{LEVEL_NAMES[nivel]}</h3>
                <p className="text-white/75 text-xs mt-1 font-semibold">
                  {totalCompras === 0
                    ? 'Faça sua primeira compra para começar!'
                    : `${totalCompras} compra${totalCompras !== 1 ? 's' : ''} concluída${totalCompras !== 1 ? 's' : ''} no total`}
                </p>
              </div>
            </div>

            {/* Reward Alert */}
            {recompensaDisponivel && !rewardClaimed && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-4 rounded-2xl border-2 border-amber-400/60 relative overflow-hidden ${
                  darkMode ? 'bg-amber-500/10' : 'bg-amber-50'
                }`}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-10 rotate-12 select-none">🎁</div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-xl">
                    🎁
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-amber-400 text-sm">Recompensa Desbloqueada! 🎉</p>
                    <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-white/70' : 'text-[#1a0030]/70'}`}>
                      Você atingiu o <strong>Nível 5</strong>! Ganhou <strong>1 produto grátis</strong> à sua escolha, qualquer sabor disponível!
                    </p>
                    <button
                      onClick={handleClaimReward}
                      disabled={rewardClaiming}
                      className="mt-3 py-2 px-5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {rewardClaiming ? 'Processando...' : '✨ Resgatar Meu Prêmio'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {rewardClaimed && (
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-300'} text-center`}>
                <p className="text-2xl mb-1">✅</p>
                <p className="font-black text-emerald-400 text-sm">Recompensa resgatada!</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/60'}`}>Entre em contato via WhatsApp para receber seu prêmio.</p>
              </div>
            )}

            {/* Progress Bar Section */}
            {nivel < 5 && (
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-3">
                  <p className={`text-[11px] font-black uppercase tracking-wider ${darkMode ? 'text-white/60' : 'text-[#1a0030]/60'}`}>Progresso do Ciclo</p>
                  <span className="text-xs font-black text-amber-400">{comprasNoCiclo}/5</span>
                </div>
                {/* Progress bar */}
                <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-purple-100'} relative`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 relative"
                  >
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
                  </motion.div>
                </div>
                <p className={`text-xs mt-3 text-center font-semibold ${darkMode ? 'text-white/70' : 'text-[#1a0030]/70'}`}>
                  {faltam === 0
                    ? '🎉 Nível máximo atingido!'
                    : faltam === 1
                      ? '🔥 Falta apenas <strong>1 compra</strong> para o próximo nível!'
                      : `⚡ Faltam <strong>${faltam} compras</strong> para o Nível ${nivel + 1}`}
                </p>
                <p className={`text-[10px] mt-1 text-center ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                  Ao atingir o Nível 5, você ganha 1 produto grátis!
                </p>
              </div>
            )}

            {nivel === 5 && !recompensaDisponivel && !rewardClaimed && (
              <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
                <p className="text-2xl mb-1">🚀</p>
                <p className="font-black text-sm">Nível máximo atingido!</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>
                  Continue comprando para iniciar um novo ciclo e ganhar mais recompensas!
                </p>
              </div>
            )}

            {/* Level Steps */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
              <p className={`text-[11px] font-black uppercase tracking-wider mb-4 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/60'}`}>Níveis do Ciclo</p>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((lv) => {
                  const achieved = comprasNoCiclo >= lv;
                  const isCurrent = comprasNoCiclo === lv;
                  const icons = ['🥉', '🥈', '🥇', '💎', '🏆'];
                  const names = ['Bronze', 'Prata', 'Ouro', 'Diamante', 'Campeão'];
                  return (
                    <div key={lv} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 border border-amber-400/40'
                        : achieved
                          ? darkMode ? 'bg-white/5' : 'bg-purple-50/50'
                          : 'opacity-35'
                    }`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        achieved ? 'bg-amber-400/20' : darkMode ? 'bg-white/5' : 'bg-purple-100'
                      }`}>
                        {achieved ? icons[lv - 1] : lv}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-xs font-bold ${achieved ? '' : darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                          Nível {lv} — {names[lv - 1]}
                        </p>
                        <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                          {lv} compra{lv !== 1 ? 's' : ''} no ciclo
                          {lv === 5 ? ' 🎁 Recompensa!' : ''}
                        </p>
                      </div>
                      {achieved && (
                        <Check size={14} className="text-amber-400 flex-shrink-0" />
                      )}
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total stats */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
              <p className={`text-[11px] font-black uppercase tracking-wider mb-3 ${darkMode ? 'text-white/60' : 'text-[#1a0030]/60'}`}>Suas Estatísticas</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-black">{totalCompras}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>Compras Totais</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-400">{Math.floor(totalCompras / 5)}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>Prêmios Ganhos</p>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {totalCompras === 0 && (
              <div className={`p-6 rounded-2xl border text-center ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="font-bold text-base mb-1">Comece sua jornada!</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-white/55' : 'text-[#1a0030]/55'}`}>
                  A cada compra concluída você sobe 1 nível. Ao chegar ao Nível 5, você ganha 1 produto grátis de qualquer sabor!
                </p>
                <button
                  onClick={onBack}
                  className="mt-4 py-2.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 shadow-md active:scale-98 transition-all"
                >
                  🛍️ Explorar Catálogo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── STOCK PRODUCT CARD ────────────────────────────────────────────────────────
interface StockProductCardProps {
  product: Product;
  darkMode: boolean;
  onToggleFlavor: (productId: number, flavorId: number) => void;
  onSetStock: (productId: number, flavorId: number, stock: number | null) => void;
  onSave: (product: Product) => Promise<void>;
}

function StockProductCard({ product, darkMode, onToggleFlavor, onSetStock, onSave }: StockProductCardProps) {
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleToggle = (flavorId: number) => {
    onToggleFlavor(product.id, flavorId);
    setDirty(true);
  };

  const handleStock = (flavorId: number, val: string) => {
    const n = val === '' ? null : parseInt(val, 10);
    if (n !== null && isNaN(n)) return;
    onSetStock(product.id, flavorId, n);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(product);
    setSaving(false);
    setDirty(false);
  };

  return (
    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-brand text-base">{product.name}</h4>
          {product.badge && <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{product.badge}</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all ${
            dirty
              ? 'bg-purple-500 text-white active:scale-95'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          {saving ? '...' : dirty ? '💾 Salvar' : 'Salvo ✓'}
        </button>
      </div>

      <div className="space-y-2">
        {product.flavors.map((flavor) => {
          const isActive = flavor.active !== false;
          const stockVal = flavor.stock ?? '';
          const isOut = flavor.stock === 0;
          const isLow = flavor.stock !== null && flavor.stock !== undefined && flavor.stock > 0 && flavor.stock <= 3;

          return (
            <div key={flavor.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
              !isActive
                ? darkMode ? 'bg-black/20 border-white/5 opacity-50' : 'bg-gray-50 border-gray-200 opacity-50'
                : darkMode ? 'bg-white/3 border-white/5' : 'bg-purple-50/30 border-purple-100'
            }`}>
              {/* Active toggle */}
              <button
                onClick={() => handleToggle(flavor.id)}
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base transition-all active:scale-90 ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
                title={isActive ? 'Desativar sabor' : 'Ativar sabor'}
              >
                {flavor.emoji}
              </button>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{flavor.name}</p>
                <p className={`text-[10px] font-bold ${
                  !isActive ? 'text-red-400' : isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {!isActive ? 'Inativo' : isOut ? 'Esgotado' : isLow ? `⚠️ Baixo (${flavor.stock})` : 'Disponível'}
                </p>
              </div>

              {/* Stock input */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleStock(flavor.id, String(Math.max(0, (flavor.stock ?? 0) - 1)))}
                  className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center text-purple-400 active:scale-90 transition-all border border-white/5"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={stockVal}
                  onChange={(e) => handleStock(flavor.id, e.target.value)}
                  placeholder="∞"
                  className={`w-12 text-center rounded-lg border outline-none font-bold text-xs py-1 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-purple-200 text-[#1a0030]'
                  }`}
                />
                <button
                  onClick={() => handleStock(flavor.id, String((flavor.stock ?? 0) + 1))}
                  className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 active:scale-90 transition-all border border-purple-500/10"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Active/inactive label */}
              <button
                onClick={() => handleToggle(flavor.id)}
                className={`text-[9px] font-black px-2 py-1 rounded-full border flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {isActive ? 'ON' : 'OFF'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STOCK HISTORY PANEL ───────────────────────────────────────────────────────
function StockHistoryPanel({ darkMode }: { darkMode: boolean }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockLog().then((data) => {
      setLogs(data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  if (logs.length === 0) return (
    <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
      <p className="text-sm opacity-50">Nenhuma movimentação de estoque registrada.</p>
    </div>
  );

  return (
    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'}`}>
      <p className="text-[11px] font-black uppercase text-purple-400 tracking-wider mb-3">📋 Histórico de Estoque</p>
      <div className="space-y-2">
        {logs.slice(0, 20).map((log, i) => {
          const d = log.details ?? {};
          const flavorName = d.flavorName ?? d.flavor_name ?? '—';
          const productName = d.productName ?? d.product_name ?? '—';
          const before = d.before ?? d.old_stock ?? 0;
          const after = d.after ?? d.new_stock ?? 0;
          const delta = after - before;
          const isPositive = delta > 0;
          const isVenda = log.action === 'stock_venda';
          return (
            <div key={i} className={`flex items-center justify-between text-xs py-2 border-b last:border-0 ${darkMode ? 'border-white/5' : 'border-purple-50'}`}>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{flavorName}</p>
                <p className={`text-[10px] truncate ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                  {productName} · {isVenda ? '🛒 Venda' : '✏️ Ajuste'}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{delta}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-white/35' : 'text-[#1a0030]/35'}`}>
                  {before} → {after}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD COMPONENT ──────────────────────────────────────────────────
interface AdminDashboardProps {
  darkMode: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  orderStatuses: Record<number, OrderStatus>;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
  onLogout: () => void;
  adminNotif: boolean;
  setAdminNotif: (val: boolean) => void;
  clientNotif: boolean;
  setClientNotif: (val: boolean) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  onRefreshOrders: () => void;
  loadingOrders: boolean;
  onDeleteOrder: (orderId: number) => Promise<void>;
  storeConfig: StoreConfig;
  isStoreOpen: boolean;
  onSaveStoreConfig: (cfg: StoreConfig) => Promise<void>;
}

export function AdminDashboard({ 
  darkMode, 
  products, 
  setProducts, 
  orders, 
  setOrders,
  orderStatuses, 
  onUpdateStatus, 
  onLogout,
  adminNotif,
  setAdminNotif,
  clientNotif,
  setClientNotif,
  whatsappNumber,
  setWhatsappNumber,
  onRefreshOrders,
  loadingOrders,
  onDeleteOrder,
  storeConfig: storeConfigProp,
  isStoreOpen: isStoreOpenProp,
  onSaveStoreConfig,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<'orders' | 'products' | 'settings' | 'metrics' | 'stock'>('orders');
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(storeConfigProp);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(isStoreOpenProp);

  // Sync from parent when it changes (e.g. on initial fetch)
  useEffect(() => {
    setStoreConfig(storeConfigProp);
    setIsStoreOpen(isStoreOpenProp);
  }, [storeConfigProp, isStoreOpenProp]);
  
  // Model insertion state
  const [showAddProp, setShowAddProp] = useState(false);
  const [npName, setNpName] = useState('');
  const [npDescription, setNpDescription] = useState('');
  const [npBadge, setNpBadge] = useState('');

  // Flavor insertion state
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [nfName, setNfName] = useState('');
  const [nfPrice, setNfPrice] = useState('');
  const [nfEmoji, setNfEmoji] = useState('🍓');
  const [nfColor, setNfColor] = useState('#C542F5');

  // Simple analytics
  const revenueValue = orders.reduce((acc, o) => acc + o.total, 0);

  const handleCreateProduct = () => {
    if (!npName.trim()) return;
    const newProduct: Product = {
      id: 0, // id=0 so upsertProduct correctly does INSERT (not UPDATE)
      name: npName.trim(),
      badge: npBadge.trim(),
      description: npDescription.trim(),
      flavors: [],
    };
    setProducts((prev: Product[]) => [...prev, newProduct]);
    setNpName('');
    setNpDescription('');
    setNpBadge('');
    setShowAddProp(false);
  };

  const handleCreateFlavor = (productId: number) => {
    if (!nfName.trim() || !nfPrice.trim()) return;
    const price = parseFloat(nfPrice);
    if (isNaN(price)) return;

    setProducts(prev => 
      prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          flavors: [
            ...p.flavors,
            {
              id: Date.now(),
              name: nfName.trim(),
              price,
              emoji: nfEmoji,
              color: nfColor
            }
          ]
        };
      })
    );

    setNfName('');
    setNfPrice('');
    setNfEmoji('🍓');
    setNfColor('#C542F5');
    setActiveProductId(null);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleDeleteFlavor = (productId: number, flavorId: number) => {
    setProducts(prev => 
      prev.map(p => {
        if (p.id !== productId) return p;
        return { ...p, flavors: p.flavors.filter(f => f.id !== flavorId) };
      })
    );
  };

  // Delete order confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  // Toggle flavor active state
  const handleToggleFlavor = (productId: number, flavorId: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          flavors: p.flavors.map(f =>
            f.id === flavorId ? { ...f, active: !f.active } : f
          ),
        };
      })
    );
  };

  // Update flavor stock
  const handleSetFlavorStock = (productId: number, flavorId: number, stock: number | null) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          flavors: p.flavors.map(f =>
            f.id === flavorId ? { ...f, stock } : f
          ),
        };
      })
    );
  };

  // Metrics calculations
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const todayOrders = orders.filter(o => new Date(o.date) >= startOfDay || o.date.includes(today.toLocaleDateString('pt-BR').split('/').reverse().join('-').slice(0, 10)));
  const monthOrders = orders.filter(o => {
    const d = new Date(o.date);
    return !isNaN(d.getTime()) ? d >= startOfMonth : o.date.includes(`${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`);
  });
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const monthRevenue = monthOrders.reduce((acc, o) => acc + o.total, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const uniqueClients = new Set(orders.map(o => o.phone)).size;

  // Best selling flavor
  const flavorSales: Record<string, { name: string; product: string; qty: number }> = {};
  orders.forEach(o => o.items.forEach(i => {
    const key = `${i.productId}-${i.flavorId}`;
    if (!flavorSales[key]) flavorSales[key] = { name: i.flavorName, product: i.productName, qty: 0 };
    flavorSales[key].qty += i.qty;
  }));
  const bestFlavor = Object.values(flavorSales).sort((a, b) => b.qty - a.qty)[0];

  // Last 7 days sales data for chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('pt-BR');
    const dayRevenue = orders.filter(o => o.date.startsWith(dateStr) || o.date.includes(dateStr)).reduce((acc, o) => acc + o.total, 0);
    return { label, value: dayRevenue };
  });
  const maxBarValue = Math.max(...last7.map(d => d.value), 1);

  // Low stock flavors
  const lowStockFlavors: { productName: string; flavorName: string; stock: number }[] = [];
  products.forEach(p => p.flavors.forEach(f => {
    if (f.stock !== null && f.stock <= 3) {
      lowStockFlavors.push({ productName: p.name, flavorName: f.name, stock: f.stock });
    }
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Tab select head */}
      <div className={`flex border-b flex-shrink-0 ${darkMode ? 'bg-[#0a0115] border-purple-500/10' : 'bg-purple-100/15 border-purple-900/10'}`}>
        <button 
          onClick={() => setTab('orders')}
          className={`flex-1 py-1.5 text-[10px] font-bold transition-all border-b-2 font-brand ${
            tab === 'orders' ? 'text-purple-500 border-purple-500' : 'text-purple-400/50 border-transparent'
          }`}
        >
          📋 PEDIDOS
        </button>
        <button 
          onClick={() => setTab('metrics')}
          className={`flex-1 py-1.5 text-[10px] font-bold transition-all border-b-2 font-brand ${
            tab === 'metrics' ? 'text-purple-500 border-purple-500' : 'text-purple-400/50 border-transparent'
          }`}
        >
          📊 MÉTRICAS
        </button>
        <button 
          onClick={() => setTab('stock')}
          className={`flex-1 py-1.5 text-[10px] font-bold transition-all border-b-2 font-brand ${
            tab === 'stock' ? 'text-purple-500 border-purple-500' : 'text-purple-400/50 border-transparent'
          }`}
        >
          📦 ESTOQUE
        </button>
        <button 
          onClick={() => setTab('products')}
          className={`flex-1 py-1.5 text-[10px] font-bold transition-all border-b-2 font-brand ${
            tab === 'products' ? 'text-purple-500 border-purple-500' : 'text-purple-400/50 border-transparent'
          }`}
        >
          🛍️ PROD.
        </button>
        <button 
          onClick={() => setTab('settings')}
          className={`flex-1 py-1.5 text-[10px] font-bold transition-all border-b-2 font-brand ${
            tab === 'settings' ? 'text-purple-500 border-purple-500' : 'text-purple-400/50 border-transparent'
          }`}
        >
          ⚙️ CONFIG
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {tab === 'orders' && (
          <div className="space-y-4">
            
            {/* ── Quick Stats Strip ── */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className={`p-3 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-gradient-to-br from-purple-500/15 to-purple-900/5 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm'
              }`}>
                <div className="absolute -right-2 -top-2 opacity-10 text-5xl font-black">📅</div>
                <p className="text-[9px] uppercase font-black text-purple-400 tracking-widest">Hoje</p>
                <p className="text-xl font-black mt-0.5 leading-none">{fmt(todayRevenue)}</p>
                <p className={`text-[10px] mt-1 ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40' }`}>{todayOrders.length} pedido(s)</p>
              </div>
              <div className={`p-3 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm'
              }`}>
                <div className="absolute -right-2 -top-2 opacity-10 text-5xl font-black">📈</div>
                <p className="text-[9px] uppercase font-black text-emerald-400 tracking-widest">Mês</p>
                <p className="text-xl font-black mt-0.5 leading-none">{fmt(monthRevenue)}</p>
                <p className={`text-[10px] mt-1 ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40' }`}>{monthOrders.length} pedido(s)</p>
              </div>
              <div className={`p-3 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-gradient-to-br from-amber-500/10 to-amber-900/5 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-sm'
              }`}>
                <div className="absolute -right-2 -top-2 opacity-10 text-5xl font-black">🎟️</div>
                <p className="text-[9px] uppercase font-black text-amber-400 tracking-widest">Ticket Médio</p>
                <p className="text-xl font-black mt-0.5 leading-none">{fmt(avgTicket)}</p>
                <p className={`text-[10px] mt-1 ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40' }`}>por pedido</p>
              </div>
              <div className={`p-3 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-gradient-to-br from-blue-500/10 to-blue-900/5 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm'
              }`}>
                <div className="absolute -right-2 -top-2 opacity-10 text-5xl font-black">👥</div>
                <p className="text-[9px] uppercase font-black text-blue-400 tracking-widest">Clientes</p>
                <p className="text-xl font-black mt-0.5 leading-none">{uniqueClients}</p>
                <p className={`text-[10px] mt-1 ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40' }`}>únicos</p>
              </div>
            </div>
            <button
              onClick={onRefreshOrders}
              disabled={loadingOrders}
              className={`w-full py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                darkMode ? 'bg-white/5 border-purple-500/20 text-purple-300 hover:bg-purple-500/10' : 'bg-white border-purple-950/10 text-purple-600 hover:bg-purple-50 shadow-sm'
              } ${loadingOrders ? 'opacity-50 cursor-wait' : ''}`}
            >
              {loadingOrders ? (
                <span className="inline-block w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : '🔄'} {loadingOrders ? 'Carregando pedidos...' : `Atualizar pedidos (${orders.length})`}
            </button>

            {/* List orders */}
            {orders.length === 0 ? (
              <div className="text-center py-20 opacity-55">
                <FileText size={40} className="mx-auto text-purple-400 mb-2" />
                <p className="text-sm font-semibold">Nenhum pedido recebido</p>
              </div>
            ) : (
              [...orders].reverse().map((o) => {
                const status = orderStatuses[o.id] || "pendente";
                return (
                  <div 
                    key={o.id}
                    className={`p-4 rounded-2xl border relative text-left ${
                      darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-black text-purple-400">Pedido #{String(o.id).slice(-6)}</span>
                        <h4 className="font-bold text-sm mt-0.5">{o.name}</h4>
                        <p className="text-[11px] opacity-60">📱 {o.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-black border tracking-wider ${
                          status === 'chegou' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                            : status === 'saiu' 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}>
                          {status === 'chegou' ? 'Entregue' : status === 'saiu' ? 'A caminho' : 'Aguardando'}
                        </span>
                        <p className="text-[10px] opacity-55 mt-1.5">{o.date}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/10 border border-white/5 space-y-1 mb-3">
                      {o.items.map((i) => (
                        <p key={i.key} className="text-xs opacity-75 truncate">
                          {i.emoji} {i.productName} ({i.flavorName}) <strong className="text-purple-500">x{i.qty}</strong>
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs opacity-70 mb-3">
                      <span>📍 {o.address}, {o.neighborhood} {o.complement ? `(${o.complement})` : ''} - {o.city}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-purple-500/10 pt-3 mb-3 text-xs">
                      <span>💳 {o.payment} {o.change ? `(Troco para: ${fmt(o.change)})` : ''}</span>
                      <span className="font-black text-purple-400 text-sm">{fmt(o.total)}</span>
                    </div>

                    {/* Delivery status controls */}
                    {status !== 'chegou' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateStatus(o.id, 'saiu')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            status === 'saiu' 
                              ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                              : 'bg-transparent border-amber-500/20 text-amber-500/60 hover:bg-amber-500/5'
                          }`}
                        >
                          🛵 Saiu para Entrega
                        </button>
                        <button
                          onClick={() => onUpdateStatus(o.id, 'chegou')}
                          className="flex-1 py-2 rounded-xl text-xs font-bold border bg-transparent border-emerald-500/20 text-emerald-500/70 hover:bg-emerald-500/10"
                        >
                          🔔 Marcar como Entregue
                        </button>
                      </div>
                    )}

                    {/* Delete Order Button */}
                    <button
                      onClick={() => setDeleteConfirmId(o.id)}
                      className="mt-2 w-full py-1.5 rounded-xl text-xs font-bold border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Excluir Pedido
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────────────── */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${
              darkMode ? 'bg-[#0c0118] border-red-500/20' : 'bg-white border-red-500/20'
            }`}>
              <div className="text-center mb-4">
                <ShieldAlert size={40} className="mx-auto text-red-400 mb-3" />
                <h3 className="font-bold text-lg">Excluir Pedido?</h3>
                <p className={`text-xs mt-2 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Esta ação não pode ser desfeita. O pedido será removido do Supabase, o estoque dos itens será restaurado e a exclusão será registrada no histórico.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${
                    darkMode ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  disabled={deletingOrderId === deleteConfirmId}
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeletingOrderId(id);
                    setDeleteConfirmId(null);
                    await onDeleteOrder(id);
                    setDeletingOrderId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  {deletingOrderId === deleteConfirmId ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : <Trash2 size={14} />} Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── METRICS TAB ─────────────────────────────────────────────────── */}
        {tab === 'metrics' && (
          <div className="space-y-4">

            {/* Header + live badge */}
            <div className="flex items-center justify-between">
              <h2 className="font-brand text-xl text-purple-400">📊 Métricas</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tempo Real
              </div>
            </div>

            {/* ── KPI Hero Cards ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Vendas Hoje */}
              <div className="col-span-2 p-4 rounded-2xl relative overflow-hidden bg-gradient-to-br from-purple-600/30 via-purple-800/20 to-transparent border border-purple-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/70 flex items-center gap-1.5"><Calendar size={11} /> Faturamento Total Geral</p>
                    <p className="text-3xl font-black mt-1 leading-none">{fmt(totalRevenue)}</p>
                    <p className={`text-[11px] mt-1.5 ${darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>{orders.length} pedidos no total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-300/50">Ticket Médio</p>
                    <p className="text-lg font-black text-purple-300 mt-0.5">{fmt(avgTicket)}</p>
                  </div>
                </div>
              </div>

              {/* Hoje */}
              <div className={`p-3.5 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-white border-purple-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Calendar size={12} className="text-purple-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Hoje</span>
                </div>
                <p className="text-xl font-black">{fmt(todayRevenue)}</p>
                <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{todayOrders.length} ped.</p>
              </div>

              {/* Mês */}
              <div className={`p-3.5 rounded-2xl border relative overflow-hidden ${
                darkMode ? 'bg-white/5 border-emerald-500/15' : 'bg-white border-emerald-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Mês</span>
                </div>
                <p className="text-xl font-black">{fmt(monthRevenue)}</p>
                <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{monthOrders.length} ped.</p>
              </div>

              {/* Clientes Únicos */}
              <div className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-blue-500/15' : 'bg-white border-blue-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users size={12} className="text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Clientes</span>
                </div>
                <p className="text-xl font-black">{uniqueClients}</p>
                <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>únicos</p>
              </div>

              {/* Melhor Sabor */}
              <div className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-amber-500/15' : 'bg-white border-amber-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Award size={12} className="text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">#1 Sabor</span>
                </div>
                <p className="text-sm font-black leading-tight truncate">{bestFlavor ? bestFlavor.name : '—'}</p>
                <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{bestFlavor ? `${bestFlavor.qty}x vendido` : 'sem dados'}</p>
              </div>
            </div>

            {/* ── 7-day Sales Chart ── */}
            <div className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[11px] font-black uppercase text-purple-400 tracking-wider">📈 Últimos 7 Dias</p>
                <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>
                  {fmt(last7.reduce((a, d) => a + d.value, 0))} total
                </p>
              </div>
              <div className="flex items-end gap-2 h-36">
                {last7.map((day, i) => {
                  const isToday = i === 6;
                  const pct = Math.max(4, (day.value / maxBarValue) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Value label on top */}
                      {day.value > 0 && (
                        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                          isToday ? 'text-purple-400' : darkMode ? 'text-white/60' : 'text-[#1a0030]/60'
                        }`}>
                          {fmt(day.value).replace('R$ ', '')}
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 ${
                          isToday
                            ? 'bg-gradient-to-t from-purple-700 to-purple-400 shadow-lg shadow-purple-500/20'
                            : darkMode ? 'bg-gradient-to-t from-purple-900/80 to-purple-600/50' : 'bg-gradient-to-t from-purple-300 to-purple-200'
                        }`}
                        style={{ height: `${pct}%`, opacity: day.value > 0 ? 1 : 0.15 }}
                      />
                      <span className={`text-[9px] font-bold capitalize ${
                        isToday ? 'text-purple-400' : darkMode ? 'text-white/40' : 'text-[#1a0030]/40'
                      }`}>{day.label}</span>
                    </div>
                  );
                })}
              </div>
              {orders.length === 0 && (
                <p className="text-center text-xs opacity-50 mt-2">Sem dados de vendas ainda</p>
              )}
            </div>

            {/* ── Top 5 Sabores ── */}
            <div className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
            }`}>
              <p className="text-[11px] font-black uppercase text-purple-400 tracking-wider mb-4">🏆 Top Sabores Mais Vendidos</p>
              {Object.values(flavorSales).length === 0 ? (
                <p className="text-xs opacity-50 text-center py-6">Sem vendas registradas ainda</p>
              ) : (
                <div className="space-y-3">
                  {Object.values(flavorSales).sort((a, b) => b.qty - a.qty).slice(0, 5).map((f, i) => {
                    const maxQty = Object.values(flavorSales).sort((a, b) => b.qty - a.qty)[0]?.qty || 1;
                    const pct = (f.qty / maxQty) * 100;
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{medals[i]}</span>
                            <div>
                              <p className="text-xs font-bold leading-tight">{f.name}</p>
                              <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{f.product}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-purple-400">{f.qty}x</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${ darkMode ? 'bg-white/5' : 'bg-purple-100' }`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Pagamentos Breakdown ── */}
            {orders.length > 0 && (() => {
              const payMap: Record<string, number> = {};
              orders.forEach(o => { payMap[o.payment] = (payMap[o.payment] || 0) + 1; });
              const payEntries = Object.entries(payMap).sort((a, b) => b[1] - a[1]);
              const payIcons: Record<string, string> = { PIX: '⚡', 'Cartão de Crédito': '💳', 'Cartão de Débito': '💳', Dinheiro: '💵' };
              return (
                <div className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                }`}>
                  <p className="text-[11px] font-black uppercase text-purple-400 tracking-wider mb-4">💳 Formas de Pagamento</p>
                  <div className="space-y-2.5">
                    {payEntries.map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          {payIcons[method] || '💳'} {method}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 rounded-full overflow-hidden w-20 ${ darkMode ? 'bg-white/5' : 'bg-purple-100' }`}>
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                              style={{ width: `${(count / orders.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-purple-400 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Pedidos por Status ── */}
            {orders.length > 0 && (() => {
              const pending = orders.filter(o => (orderStatuses[o.id] || o.status || 'pendente') === 'pendente').length;
              const onWay = orders.filter(o => (orderStatuses[o.id] || o.status || 'pendente') === 'saiu').length;
              const delivered = orders.filter(o => (orderStatuses[o.id] || o.status || 'pendente') === 'chegou').length;
              return (
                <div className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                }`}>
                  <p className="text-[11px] font-black uppercase text-purple-400 tracking-wider mb-4">📦 Status dos Pedidos</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-3 rounded-xl border ${ darkMode ? 'bg-purple-500/10 border-purple-500/25' : 'bg-purple-50 border-purple-200' }`}>
                      <p className="text-xl font-black text-purple-400">{pending}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-purple-400/70 mt-0.5">Aguard.</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${ darkMode ? 'bg-amber-500/10 border-amber-500/25' : 'bg-amber-50 border-amber-200' }`}>
                      <p className="text-xl font-black text-amber-400">{onWay}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/70 mt-0.5">A Caminho</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${ darkMode ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200' }`}>
                      <p className="text-xl font-black text-emerald-400">{delivered}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70 mt-0.5">Entregue</p>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {tab === 'stock' && (() => {
          const outFlavors  = lowStockFlavors.filter(f => f.stock === 0);
          const warnFlavors = lowStockFlavors.filter(f => f.stock !== null && f.stock > 0 && f.stock <= 5);
          return (
            <div className="space-y-4">

              {/* ── Header ── */}
              <div className="flex items-center justify-between">
                <h2 className="font-brand text-xl text-purple-400">📦 Estoque</h2>
                {lowStockFlavors.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {lowStockFlavors.length} alerta(s)
                  </div>
                )}
              </div>

              {/* ── Esgotados ── */}
              {outFlavors.length > 0 && (
                <div className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-xs font-black text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle size={13} /> 🔴 Esgotados — {outFlavors.length} item(s)
                  </p>
                  <div className="space-y-2">
                    {outFlavors.map((f, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">{f.flavorName}</p>
                          <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{f.productName}</p>
                        </div>
                        <span className="text-[10px] font-black text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">ESGOTADO</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Críticos (1-5 un.) ── */}
              {warnFlavors.length > 0 && (
                <div className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-amber-500/10 border-amber-500/25' : 'bg-amber-50 border-amber-300'
                }`}>
                  <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle size={13} /> 🟡 Estoque Baixo — {warnFlavors.length} item(s)
                  </p>
                  <div className="space-y-3">
                    {warnFlavors.map((f, i) => {
                      const pct = Math.max(5, ((f.stock ?? 0) / 10) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="text-xs font-bold">{f.flavorName}</p>
                              <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>{f.productName}</p>
                            </div>
                            <span className="text-xs font-black text-amber-400">{f.stock} un.</span>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-amber-100'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                              style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Por Produto ── */}
              {products.map((p) => (
                <StockProductCard
                  key={p.id}
                  product={p}
                  darkMode={darkMode}
                  onToggleFlavor={handleToggleFlavor}
                  onSetStock={handleSetFlavorStock}
                  onSave={async (product) => {
                    // Log adjustments before saving
                    const original = products.find(pr => pr.id === product.id);
                    if (original) {
                      for (const f of product.flavors) {
                        const orig = original.flavors.find(of => of.id === f.id);
                        if (orig && orig.stock !== f.stock) {
                          await logStockAdjust(product.id, product.name, f.id, f.name, orig.stock, f.stock);
                        }
                      }
                    }
                    await upsertProduct(product);
                    setProducts(prev => prev.map(pr => pr.id === product.id ? product : pr));
                  }}
                />
              ))}

              {/* ── Histórico de Movimentação ── */}
              <StockHistoryPanel darkMode={darkMode} />

            </div>
          );
        })()}

        {tab === 'products' && (
          <div className="space-y-4">
            
            {/* Adding model toggle button */}
            <button 
              onClick={() => setShowAddProp(true)}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 shadow-md font-brand"
            >
              + Adicionar Novo Modelo / Linha
            </button>

            {showAddProp && (
              <div className={`p-4 rounded-2xl border animate-fade-in text-left ${
                darkMode ? 'bg-white/5 border-purple-500/15' : 'bg-white border-purple-950/15 shadow-md'
              }`}>
                <h3 className="font-brand text-base text-purple-500 mb-4">🆕 Novo Modelo / Pod</h3>
                <Input label="Nome do Modelo" placeholder="Lost Mary Dura 40K" value={npName} onChange={(e) => setNpName(e.target.value)} darkMode={darkMode} />
                <Input label="Badge / Puffs (Vazio se não houver)" placeholder="40.000 PUFFS" value={npBadge} onChange={(e) => setNpBadge(e.target.value)} darkMode={darkMode} />
                <Input label="Descrição / Subtítulo curto" placeholder="Ultra durável com indicador de bateria LED" value={npDescription} onChange={(e) => setNpDescription(e.target.value)} darkMode={darkMode} />
                <div className="flex gap-2">
                  <Btn style={{ flex: 1 }} onClick={handleCreateProduct}>Confirmar & Salvar</Btn>
                  <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setShowAddProp(false)}>Cancelar</Btn>
                </div>
              </div>
            )}

            {/* List and edit products */}
            {products.map((p) => (
              <div 
                key={p.id}
                className={`p-4 rounded-2xl border text-left ${
                  darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-brand text-lg">{p.name}</h4>
                      {p.badge && <span className="bg-purple-500/10 text-purple-400 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">{p.badge}</span>}
                    </div>
                    <p className="text-[11px] opacity-60 mt-1">{p.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold"
                    title="Excluir produto inteiro"
                  >
                    Excluir
                  </button>
                </div>

                <div className="divider border-t border-purple-500/5 my-3 h-0" />

                {/* Local flavors on model */}
                <h5 className="text-[10px] uppercase font-black text-purple-400 tracking-wider mb-2 font-brand">Opções de Sabores ({p.flavors.length})</h5>
                <div className="space-y-1.5 mb-3">
                  {p.flavors.map((f) => (
                    <div key={f.id} className="flex justify-between items-center p-2 rounded-xl bg-black/10 border border-white/5">
                      <span className="text-xs font-bold text-white">{f.emoji} {f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-500">{fmt(f.price)}</span>
                        <button onClick={() => handleDeleteFlavor(p.id, f.id)} className="p-1 text-red-500/70 hover:text-red-500 font-bold text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                  {p.flavors.length === 0 && <p className="text-xs opacity-50 text-center py-4">Sem sabores adicionados.</p>}
                </div>

                {/* Inline flavour creator panel */}
                {activeProductId === p.id ? (
                  <div className="p-3 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 space-y-3">
                    <Input label="Sabor" placeholder="Menta Intensa" value={nfName} onChange={(e) => setNfName(e.target.value)} darkMode={darkMode} />
                    <Input label="Preço (R$)" type="number" placeholder="109,90" value={nfPrice} onChange={(e) => setNfPrice(e.target.value)} darkMode={darkMode} />
                    <Input label="Emoji descriptivo" placeholder="🌿" value={nfEmoji} onChange={(e) => setNfEmoji(e.target.value)} darkMode={darkMode} />
                    <div className="flex gap-2">
                      <Btn size="sm" style={{ flex: 1 }} onClick={() => handleCreateFlavor(p.id)}>Salvar sabor</Btn>
                      <Btn variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => setActiveProductId(null)}>Cancelar</Btn>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveProductId(p.id);
                      setNfName('');
                      setNfPrice('');
                    }}
                    className="w-full py-1.5 rounded-xl border border-dashed border-purple-500/20 text-purple-400 hover:border-purple-400 active:scale-99 transition-all text-xs font-bold"
                  >
                    + Adicionar sabor
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className={`p-4 rounded-2xl border space-y-4 text-left ${
            darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
          }`}>
            <h3 className="font-brand text-lg text-purple-500 mb-4">⚙️ Painel Config</h3>

            {/* Notification settings panel */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-4">
              <h4 className="font-brand text-sm mb-3">🔔 Notificações nativas</h4>
              
              <NotifToggle 
                label="Receber avisos de vendas" 
                desc="Receba popups nativos no celular/PC quando houver um pedido novo!" 
                enabled={adminNotif} 
                onToggle={async () => {
                  if (!adminNotif) {
                    const ok = await requestNotificationPermission();
                    if (ok) setAdminNotif(true);
                  } else {
                    setAdminNotif(false);
                    localStorage.setItem('fg_admin_notif', 'false');
                  }
                }} 
                darkMode={darkMode}
              />

              <NotifToggle 
                label="Modo de disparo em massa" 
                desc="Disparar pop-ups aos clientes quando houver novos sabores cadastrados." 
                enabled={clientNotif} 
                onToggle={async () => {
                  if (!clientNotif) {
                    const ok = await requestNotificationPermission();
                    if (ok) setClientNotif(true);
                  } else {
                    setClientNotif(false);
                    localStorage.setItem('fg_client_notif', 'false');
                  }
                }} 
                darkMode={darkMode}
              />
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">WhatsApp Destinatário</label>
                <input 
                  type="text" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-sm transition-all border ${
                    darkMode 
                      ? 'bg-white/5 border-purple-500/15 text-white' 
                      : 'bg-purple-100/10 border-purple-950/15 text-[#1a0030]'
                  }`}
                />
                <p className="text-[10px] text-zinc-500 mt-1">Insira com o código país (Ex: 5534...)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Taxa de Frete</label>
                <input 
                  type="text" 
                  disabled
                  value="R$ 5,00 (Fixo)"
                  className={`w-full p-3 rounded-xl outline-none text-sm border opacity-70 ${
                    darkMode 
                      ? 'bg-white/5 border-purple-500/15 text-white' 
                      : 'bg-purple-100/10 border-purple-950/15 text-[#1a0030]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Admin Credentials</label>
                <div className="p-3 bg-black/10 rounded-xl space-y-1.5">
                  <p className="text-xs opacity-75">Usuário: <strong className="text-white">admin</strong></p>
                  <p className="text-xs opacity-75">Senha: <strong className="text-white">frutinhas2024</strong></p>
                </div>
              </div>
            </div>

            {/* ── HORÁRIO DE FUNCIONAMENTO ── */}
            <div className={`p-4 rounded-xl border space-y-4 ${
              darkMode ? 'bg-white/5 border-purple-500/10' : 'bg-white border-purple-950/10 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-purple-400 tracking-wider">⏰ Horário de Funcionamento</p>
                  <p className={`text-[10px] mt-0.5 ${ darkMode ? 'text-white/45' : 'text-[#1a0030]/50'}`}>Pedidos só podem ser finalizados neste período</p>
                </div>
                {/* Status badge */}
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  isStoreOpen
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/15 border-red-500/30 text-red-400'
                }`}>
                  {isStoreOpen ? '🟢 ABERTA' : '🔴 FECHADA'}
                </div>
              </div>

              {/* Toggle manual open/close */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-xs font-bold">Loja aberta manualmente</p>
                  <p className={`text-[10px] mt-0.5 ${ darkMode ? 'text-white/40' : 'text-[#1a0030]/40'}`}>Desative para fechar a loja independente do horário</p>
                </div>
                <button
                  onClick={async () => {
                    const updated = { ...storeConfig, loja_aberta: !storeConfig.loja_aberta };
                    setStoreConfig(updated);
                    setIsStoreOpen(checkIsStoreOpen(updated));
                    await onSaveStoreConfig(updated);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                    storeConfig.loja_aberta ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    storeConfig.loja_aberta ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Open / Close time pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${ darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>Abertura</label>
                  <input
                    type="time"
                    value={storeConfig.abertura}
                    onChange={(e) => setStoreConfig(prev => ({ ...prev, abertura: e.target.value }))}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-bold text-center ${
                      darkMode ? 'bg-white/5 border-purple-500/15 text-white' : 'bg-purple-50 border-purple-200 text-[#1a0030]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${ darkMode ? 'text-white/50' : 'text-[#1a0030]/50'}`}>Fechamento</label>
                  <input
                    type="time"
                    value={storeConfig.fechamento}
                    onChange={(e) => setStoreConfig(prev => ({ ...prev, fechamento: e.target.value }))}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-bold text-center ${
                      darkMode ? 'bg-white/5 border-purple-500/15 text-white' : 'bg-purple-50 border-purple-200 text-[#1a0030]'
                    }`}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className={`text-center text-[10px] py-1.5 rounded-lg ${ darkMode ? 'text-white/35' : 'text-[#1a0030]/40'}`}>
                Atendimento: <strong>{storeConfig.abertura}</strong> às <strong>{storeConfig.fechamento}</strong>
              </div>

              {/* Save button */}
              <button
                onClick={async () => {
                  await onSaveStoreConfig(storeConfig);
                  setIsStoreOpen(checkIsStoreOpen(storeConfig));
                  alert(`✅ Horário salvo!\nAbertura: ${storeConfig.abertura} | Fechamento: ${storeConfig.fechamento}`);
                }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-700 to-purple-500 active:scale-98 transition-all"
              >
                💾 Salvar Horário
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP COMPONENT ────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fg_dark_mode') !== 'false';
  });
  
  const [screen, setScreen] = useState<string>(() => {
    if (localStorage.getItem('fg_user_saved') === 'true') {
      return 'store';
    }
    if (localStorage.getItem('fg_admin_saved') === 'true') {
      return 'admin';
    }
    return 'login';
  });

  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (localStorage.getItem('fg_user_saved') === 'true') {
      return {
        name: localStorage.getItem('fg_user_name') || '',
        phone: localStorage.getItem('fg_user_phone') || '',
      };
    }
    return null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    const raw = localStorage.getItem('fg_last_order');
    return raw ? JSON.parse(raw) : null;
  });
  
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return localStorage.getItem('fg_whatsapp_number') || INITIAL_WHATSAPP_NUMBER;
  });

  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [useSimulator, setUseSimulator] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // ── Store Config (Horário de Funcionamento) ──
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    abertura: '09:00',
    fechamento: '22:00',
    loja_aberta: true,
  });
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);

  // Recalcula se a loja está aberta sempre que storeConfig muda ou a cada 30s
  useEffect(() => {
    const recalc = () => setIsStoreOpen(checkIsStoreOpen(storeConfig));
    recalc();
    const timer = setInterval(recalc, 30000);
    return () => clearInterval(timer);
  }, [storeConfig]);

  // Carrega config da loja no mount
  useEffect(() => {
    fetchStoreConfig().then((cfg) => {
      setStoreConfig(cfg);
      setIsStoreOpen(checkIsStoreOpen(cfg));
    });
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Load products from Supabase on mount
  useEffect(() => {
    setLoadingProducts(true);
    fetchProducts().then((data) => {
      if (data.length === 0) {
        // Seed with initial products if DB is empty
        Promise.all(INITIAL_PRODUCTS.map((p) => upsertProduct(p))).then((saved) => {
          setProducts(saved.filter(Boolean) as Product[]);
          setLoadingProducts(false);
        });
      } else {
        setProducts(data);
        setLoadingProducts(false);
      }
    });
  }, []);

  // Carrega pedidos do Supabase — roda no mount E toda vez que entra no painel admin
  const loadOrders = () => {
    setLoadingOrders(true);
    fetchOrders().then((data) => {
      setOrders(data); // sempre atualiza, mesmo que vazio
      setLoadingOrders(false);
    }).catch(() => setLoadingOrders(false));
  };

  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount

  useEffect(() => {
    if (screen !== 'admin') return;

    // Carrega imediatamente ao entrar no admin
    loadOrders();

    // Polling a cada 10s — garante novos pedidos mesmo sem Supabase Realtime configurado
    const interval = setInterval(() => {
      fetchOrders().then((data) => {
        setOrders(data);
      });
    }, 10000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const [orderStatuses, setOrderStatuses] = useState<Record<number, OrderStatus>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fg_orders_status') || '{}');
    } catch {
      return {};
    }
  });

  const [clientNotifEnabled, setClientNotifEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fg_client_notif') === 'true';
  });
  const [adminNotifEnabled, setAdminNotifEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fg_admin_notif') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('fg_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const handleNotify = (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: LOGO_IMAGE_URI,
      });
    } catch (e) {
      console.error('Failed to trigger notification', e);
    }
  };

  // Supabase Realtime -- sync produtos em tempo real (estoque atualiza para todos)
  useEffect(() => {
    const channel = subscribeToProductChanges((updatedProduct) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    });
    return () => { channel.unsubscribe(); };
  }, []);

  // Supabase Realtime -- notifica ADMIN sobre NOVOS pedidos em tempo real
  useEffect(() => {
    if (screen !== 'admin') return;

    // Captura IDs ja conhecidos para NAO notificar pedidos existentes ao abrir o app
    const existingIds = new Set(orders.map((o) => o.id));

    const channel = subscribeToNewOrders((newOrder) => {
      if (existingIds.has(newOrder.id)) return; // ja existia, ignorar
      existingIds.add(newOrder.id);

      setOrders((prev) => {
        if (prev.find((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      if (adminNotifEnabled) {
        handleNotify(
          'Novo Pedido Recebido!',
          `Cliente ${newOrder.name} fez ${newOrder.items.length} item(s)! Total: R$ ${newOrder.total.toFixed(2).replace('.', ',')}`
        );
      }
    });

    return () => { channel.unsubscribe(); };
  }, [screen, adminNotifEnabled]);

  // Supabase Realtime -- notifica CLIENTE sobre status do SEU pedido
  useEffect(() => {
    if (!lastOrder || screen === 'admin') return;
    if (!clientNotifEnabled) return;

    const channel = subscribeToOrderStatus(lastOrder.id, (status) => {
      if (status === 'saiu') {
        handleNotify('Pedido a caminho!', 'Seu pedido saiu para entrega! Fique de olho.');
      } else if (status === 'chegou') {
        handleNotify('Motoboy na porta!', 'Seu pedido chegou! O entregador esta na porta.');
      }
    });

    return () => { channel.unsubscribe(); };
  }, [lastOrder?.id, clientNotifEnabled, screen]);

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    // Captura o status ANTERIOR antes de atualizar qualquer estado
    const previousStatus = orderStatuses[orderId] || orders.find((o) => o.id === orderId)?.status || 'pendente';
    const order = orders.find((o) => o.id === orderId);

    const nextStatuses = { ...orderStatuses, [orderId]: status };
    setOrderStatuses(nextStatuses);
    localStorage.setItem('fg_orders_status', JSON.stringify(nextStatuses));

    // Envia WhatsApp ANTES do await (window.open precisa de gesto do usuario)
    if (order && (status === 'saiu' || status === 'chegou')) {
      const rawPhone = order.phone.replace(/\D/g, '');
      const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
      const firstName = order.name.split(' ')[0];
      const msg = status === 'saiu'
        ? `Ola ${firstName}! Seu pedido da *Frutinhas Geladas* saiu para entrega e ja esta a caminho! Em breve estara na sua porta. `
        : `Seu pedido chegou! O entregador esta na sua porta agora. Aproveite, ${firstName}! `;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    // Persiste status no Supabase
    await dbUpdateOrderStatus(orderId, status);

    // ✅ Ranking e estoque só na PRIMEIRA vez que o pedido chega como 'chegou'
    // Se o admin mudar o status de volta e depois para 'chegou' de novo, NÃO incrementa de novo
    const isFirstTimeChegou = status === 'chegou' && previousStatus !== 'chegou';

    if (isFirstTimeChegou && order) {
      // Decrementa estoque dos itens entregues
      await decrementStock(order.items, products, orderId);

      // Incrementa ranking/fidelidade do cliente — APENAS na primeira confirmação
      await incrementCustomerRanking(order.phone, order.name);

      // Recarrega produtos para refletir o novo estoque em tempo real
      fetchProducts().then((updated) => {
        if (updated.length > 0) setProducts(updated);
      });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Registra auditoria ANTES de deletar
    await logAudit('delete_order', orderId, {
      order,
      deleted_at: new Date().toISOString(),
      deleted_by: 'admin',
    });

    // Restaura estoque dos itens do pedido excluído
    const restoredProducts = products.map((product) => {
      const hasItems = order.items.some((i) => i.productId === product.id);
      if (!hasItems) return product;
      return {
        ...product,
        flavors: product.flavors.map((flavor) => {
          const item = order.items.find(
            (i) => i.productId === product.id && i.flavorId === flavor.id
          );
          if (!item || flavor.stock === null) return flavor;
          return { ...flavor, stock: (flavor.stock ?? 0) + item.qty };
        }),
      };
    });

    // Salva estoque restaurado
    for (const product of restoredProducts) {
      const original = products.find((p) => p.id === product.id);
      if (original && JSON.stringify(original.flavors) !== JSON.stringify(product.flavors)) {
        await upsertProduct(product);
      }
    }
    setProducts(restoredProducts);

    // Deleta do Supabase e estado local
    await dbDeleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const buildWhatsAppLink = (order: Order) => {
    const lines = [
      "🍓 *FRUTINHAS GELADAS — NOVO PEDIDO!* 🍓",
      "━━━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Cliente:* ${order.name}`,
      `📱 *WhatsApp:* ${order.phone}`,
      `📍 *Endereço:* ${order.address}, ${order.neighborhood}`,
      `🏙️ *Cidade:* ${order.city}`,
      order.complement ? `🏠 *Complemento:* ${order.complement}` : null,
      "━━━━━━━━━━━━━━━━━━━━━━━",
      "🛒 *ITENS DO PEDIDO:*",
      ...order.items.map(
        (i) =>
          `  ${i.emoji} *${i.productName}*\n     Sabor: ${i.flavorName}\n     Qtd: ${i.qty}x ${fmt(i.price)} = *${fmt(i.qty * i.price)}*`
      ),
      "━━━━━━━━━━━━━━━━━━━━━━━",
      `📦 *Subtotal:* ${fmt(order.subtotal)}`,
      `🚚 *Frete:* ${fmt(DELIVERY_FEE)}`,
      `💰 *TOTAL: ${fmt(order.total)}*`,
      "━━━━━━━━━━━━━━━━━━━━━━━",
      `💳 *Pagamento:* ${order.payment}`,
      order.change ? `💵 *Troco para:* ${fmt(order.change)}` : null,
      "",
      "✅ _Pedido gerado via Frutinhas Geladas App_",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines)}`;
  };

  const prevProductsRef = useRef<Product[]>(products);
  useEffect(() => {
    if (products.length > prevProductsRef.current.length && clientNotifEnabled) {
      const addedProduct = products[products.length - 1];
      handleNotify('🆕 Novo Lançamento!', `${addedProduct.name} acabou de chegar na loja! Aproveite. 😍`);
    }
    prevProductsRef.current = products;
  }, [products, clientNotifEnabled]);

  const handleLogout = () => {
    localStorage.removeItem('fg_user_saved');
    localStorage.removeItem('fg_user_name');
    localStorage.removeItem('fg_user_phone');
    setCustomer(null);
    setScreen('login');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('fg_admin_saved');
    setScreen('login');
  };

  const currentOrderStatus = lastOrder ? (orderStatuses[lastOrder.id] || 'pendente') : 'pendente';

  // Core Mobile App Content
  const renderAppCore = () => {
    return (
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex flex-col justify-between p-6"
          >
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full transition-all border ${
                  darkMode ? 'bg-white/5 border-purple-500/20 text-purple-400' : 'bg-purple-950/10 border-purple-800/15 text-purple-800'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <div className="flex flex-col items-center text-center my-auto py-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full scale-110 animate-pulse"></div>
                <img src={LOGO_IMAGE_URI} alt="Frutinhas Logo" className="w-[110px] h-[110px] rounded-full object-cover relative z-10 border-2 border-purple-400/40" />
              </div>
              <h1 className="font-brand text-4xl font-black tracking-wide mb-2">Frutinhas</h1>
              <h2 className="font-brand text-2xl text-purple-500 tracking-widest uppercase mb-4">GELADAS ❄️</h2>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-[#1a0030]/60'}`}>Os melhores pods da cidade e região! ⚡</p>
            </div>

            <LoginForm 
              darkMode={darkMode}
              onLogin={async (name, phone, saveSession) => {
                if (saveSession) {
                  localStorage.setItem('fg_user_saved', 'true');
                  localStorage.setItem('fg_user_name', name);
                  localStorage.setItem('fg_user_phone', phone);
                } else {
                  localStorage.removeItem('fg_user_saved');
                }
                setCustomer({ name, phone });
                
                const allowed = await requestNotificationPermission();
                if (allowed) {
                  setClientNotifEnabled(true);
                  localStorage.setItem('fg_client_notif', 'true');
                }
                
                setScreen('store');
              }}
              onGoAdmin={() => setScreen('admin-login')}
            />
          </motion.div>
        )}

        {screen === 'admin-login' && (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 justify-center"
          >
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-brand text-purple-500">⚙️ Acesso Admin</h2>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-purple-400/80 hover:text-purple-400"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <AdminLoginForm 
              darkMode={darkMode}
              onSuccess={(staySignedIn) => {
                if (staySignedIn) {
                  localStorage.setItem('fg_admin_saved', 'true');
                }
                setScreen('admin');
              }}
              onBack={() => setScreen('login')}
            />
          </motion.div>
        )}

        {screen === 'store' && customer && (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* ── TOP HEADER ── */}
            <div
              className={`px-4 pb-3 border-b flex justify-between items-center z-10 flex-shrink-0 ${
                darkMode ? 'bg-[#0c0118]/95 border-purple-500/10' : 'bg-white/95 border-[#1a0030]/10'
              } backdrop-blur-md`}
              style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
            >
              <Logo size={32} />
              {/* Horário de funcionamento pill — visível para clientes */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black ${
                isStoreOpen
                  ? darkMode ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : darkMode ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-red-50 border-red-300 text-red-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${ isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {isStoreOpen ? 'Aberto' : 'Fechado'}
                <span className={`${darkMode ? 'text-white/40' : 'text-black/30'} font-normal`}>
                  {storeConfig.abertura}–{storeConfig.fechamento}
                </span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-all border ${
                  darkMode ? 'bg-white/5 border-purple-500/15 text-purple-400' : 'bg-purple-950/10 border-purple-800/10 text-purple-800'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* ── BANNER LOJA FECHADA ── */}
            {!isStoreOpen && (
              <div className={`flex-shrink-0 px-4 py-2 flex items-center gap-2 ${
                darkMode ? 'bg-red-900/20 border-b border-red-500/20' : 'bg-red-50 border-b border-red-200'
              }`}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <p className="text-xs font-bold text-red-400">
                  Loja fechada — atendemos das <strong>{storeConfig.abertura}</strong> às <strong>{storeConfig.fechamento}</strong>
                  {!storeConfig.loja_aberta && ' (fechado pelo administrador)'}
                </p>
              </div>
            )}

            {/* ── CATALOG (takes available space above bottom nav) ── */}
            <div className="flex-1 overflow-hidden relative" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
              <CatalogView 
                darkMode={darkMode}
                customer={customer}
                products={products}
                cart={cart}
                setCart={setCart}
                onOpenCart={() => setScreen('cart')}
              />
            </div>

            {/* ── BOTTOM NAVIGATION BAR ── */}
            <div
              className={`fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t ${
                darkMode
                  ? 'bg-[#0a0115]/95 border-purple-500/10 backdrop-blur-xl'
                  : 'bg-white/95 border-[#1a0030]/10 backdrop-blur-xl'
              }`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* Catálogo */}
              <button
                onClick={() => {}}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                <Store size={22} strokeWidth={2} />
                <span className="text-[10px] font-black tracking-wide uppercase">Loja</span>
              </button>

              {/* Pedidos */}
              <button
                onClick={() => setScreen('history')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all ${
                  darkMode ? 'text-white/40 hover:text-purple-400' : 'text-[#1a0030]/40 hover:text-purple-600'
                }`}
              >
                <History size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Pedidos</span>
              </button>

              {/* Ranking — destaque especial */}
              <button
                onClick={() => setScreen('ranking')}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-amber-300/40">
                  <Trophy size={22} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black tracking-wide uppercase text-amber-400 mt-5">Ranking</span>
              </button>

              {/* Carrinho (atalho) */}
              <button
                onClick={() => setScreen('cart')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all relative ${
                  darkMode ? 'text-white/40 hover:text-purple-400' : 'text-[#1a0030]/40 hover:text-purple-600'
                }`}
              >
                <div className="relative">
                  <ShoppingCart size={22} strokeWidth={2} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-black flex items-center justify-center">
                      {cart.reduce((a, i) => a + i.qty, 0)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-wide uppercase">Carrinho</span>
              </button>

              {/* Sair */}
              <button
                onClick={handleLogout}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all ${
                  darkMode ? 'text-white/30 hover:text-red-400' : 'text-[#1a0030]/30 hover:text-red-500'
                }`}
              >
                <LogOut size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Sair</span>
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'cart' && customer && (
          <motion.div
            key="cart"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <CartView 
              darkMode={darkMode}
              customer={customer}
              cart={cart}
              setCart={setCart}
              isStoreOpen={isStoreOpen}
              storeConfig={storeConfig}
              onBack={() => setScreen('store')}
              onCheckout={async (order) => {
                // ⚠️ IMPORTANTE: window.open() DEVE ser chamado ANTES de qualquer await.
                // Após um await, o browser PWA considera que não é mais um gesto do usuário
                // e bloqueia a abertura de novas janelas (popup blocker).
                const link = buildWhatsAppLink(order);
                window.open(link, '_blank');

                // Salva no Supabase e obtém o id real do banco
                const saved = await insertOrder(order);
                const finalOrder = saved || order;

                setOrders((prev) => [finalOrder, ...prev]);
                setLastOrder(finalOrder);
                localStorage.setItem('fg_last_order', JSON.stringify(finalOrder));
                setCart([]);

                // ℹ️ O estoque NÃO é baixado aqui.
                // Ele só será decrementado quando o ADMIN confirmar a entrega (status 'chegou').

                if (adminNotifEnabled) {
                  handleNotify('Novo Pedido!', `Cliente ${order.name} acabou de pedir ${order.items.length} item(s)!`);
                }

                setScreen('success');
              }}
            />
          </motion.div>
        )}

        {screen === 'success' && lastOrder && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            <OrderSuccess 
              darkMode={darkMode}
              order={lastOrder}
              orderStatus={currentOrderStatus}
              onActionNew={() => setScreen('store')}
              onViewHistory={() => setScreen('history')}
            />
          </motion.div>
        )}

        {screen === 'history' && customer && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <CustomerHistory
              darkMode={darkMode}
              customer={customer}
              onBack={() => setScreen(lastOrder ? 'success' : 'store')}
              onRepeatOrder={(items) => {
                setCart(items);
                setScreen('cart');
              }}
            />
          </motion.div>
        )}

        {screen === 'ranking' && customer && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <RankingView
              darkMode={darkMode}
              customer={customer}
              onBack={() => setScreen('store')}
            />
          </motion.div>
        )}


        {screen === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className={`p-4 border-b flex justify-between items-center z-10 ${darkMode ? 'bg-[#0c0118]/95 border-purple-500/10' : 'bg-white/95 border-[#1a0030]/10'} backdrop-blur-md`}>
              <Logo size={28} />
              <button 
                onClick={handleAdminLogout}
                title="Sair do painel administrador"
                className={`p-2 rounded-xl transition-all border text-xs font-semibold flex items-center gap-1 ${
                  darkMode ? 'bg-white/5 border-red-500/15 text-red-400' : 'bg-red-500/10 border-red-500/10 text-red-600'
                }`}
              >
                <LogOut size={14} /> Sair do Painel
              </button>
            </div>

            <AdminDashboard 
              darkMode={darkMode}
              products={products}
              setProducts={async (updater) => {
                // Support both direct value and functional updater
                const next = typeof updater === 'function' ? updater(products) : updater;
                // Build final array with real DB ids after insert/update
                const finalNext = [...next];
                for (let i = 0; i < finalNext.length; i++) {
                  const p = finalNext[i];
                  // A product with id=0 is new (needs INSERT)
                  // A product whose id doesn't match any existing is also new
                  const existing = p.id > 0 ? products.find((x) => x.id === p.id) : null;
                  if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
                    const saved = await upsertProduct(p);
                    if (saved) finalNext[i] = saved; // Use real DB id
                  }
                }
                // Detect deleted products and remove from Supabase
                for (const p of products) {
                  if (p.id > 0 && !finalNext.find((x) => x.id === p.id)) {
                    await dbDeleteProduct(p.id);
                  }
                }
                setProducts(finalNext);
              }}
              orders={orders}
              setOrders={async (updater) => {
                const next = typeof updater === 'function' ? updater(orders) : updater;
                // Detect deleted orders
                for (const o of orders) {
                  if (!next.find((x) => x.id === o.id)) {
                    await dbDeleteOrder(o.id);
                  }
                }
                setOrders(next);
              }}
              orderStatuses={orderStatuses}
              onUpdateStatus={updateOrderStatus}
              onLogout={handleAdminLogout}
              adminNotif={adminNotifEnabled}
              setAdminNotif={(val) => {
                setAdminNotifEnabled(val);
                localStorage.setItem('fg_admin_notif', val ? 'true' : 'false');
              }}
              clientNotif={clientNotifEnabled}
              setClientNotif={(val) => {
                setClientNotifEnabled(val);
                localStorage.setItem('fg_client_notif', val ? 'true' : 'false');
              }}
              whatsappNumber={whatsappNumber}
              setWhatsappNumber={(val) => {
                setWhatsappNumber(val);
                localStorage.setItem('fg_whatsapp_number', val);
              }}
              onRefreshOrders={loadOrders}
              loadingOrders={loadingOrders}
              onDeleteOrder={handleDeleteOrder}
              storeConfig={storeConfig}
              isStoreOpen={isStoreOpen}
              onSaveStoreConfig={async (cfg) => {
                await saveStoreConfig(cfg);
                setStoreConfig(cfg);
                setIsStoreOpen(checkIsStoreOpen(cfg));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Beautiful desktop landing blocker
  const renderDesktopLanding = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://frutinhas-geladas.app';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=c542f5&bgcolor=080112&data=${encodeURIComponent(currentUrl)}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
      <div className="min-h-screen bg-[#080112] text-white flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-8 md:gap-16 relative overflow-hidden select-none">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Left Column: Simulated Device mockup (non-interactive preview) */}
        <div className="relative flex-shrink-0 animate-fade-in hidden md:block">
          <div className="w-[300px] h-[600px] rounded-[44px] border-[10px] border-zinc-800 bg-[#0c0118] shadow-[0_20px_50px_rgba(139,47,201,0.2)] overflow-hidden relative flex flex-col p-4 items-center justify-between text-center">
            {/* Notch */}
            <div className="w-24 h-4 bg-zinc-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
            
            {/* Mock Image / Content inside */}
            <div className="mt-8 flex flex-col items-center">
              <img src={LOGO_IMAGE_URI} alt="Frutinhas Logo" className="w-20 h-20 rounded-full object-cover border border-purple-400/20" />
              <h3 className="font-brand text-2xl mt-4">Frutinhas</h3>
              <h4 className="font-brand text-sm text-purple-500 uppercase tracking-widest leading-none mt-1">GELADAS ❄️</h4>
            </div>

            <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-xs text-purple-300 w-full mb-6 leading-relaxed">
              🍓 Os melhores vapes e essências premium estão aqui! Peça de qualquer lugar com entrega rápida.
            </div>

            <div className="w-16 h-1 bg-zinc-700 rounded-full mb-1"></div>
          </div>
        </div>

        {/* Right Column: Information & Connections */}
        <div className="max-w-md text-left z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 w-fit">
            <Smartphone size={13} /> Acesso exclusivo via Smartphone
          </div>

          <h1 className="font-brand text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Frutinhas <span className="text-purple-500">Geladas</span> 🍓
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Para garantir a melhor experiência possível, design otimizado para o toque, pedidos automatizados diretos pelo WhatsApp e rastreamento em tempo real, este app foi construído exclusivamente para dispositivos móveis.
          </p>

          {/* QR Code Container */}
          <div className="p-4 bg-[#0c0118] border border-purple-500/15 rounded-3xl flex items-center gap-5 mb-6 shadow-xl">
            <div className="bg-[#080112] p-2.5 rounded-2xl border border-purple-500/10 flex-shrink-0">
              <img src={qrCodeUrl} alt="Escaneie o QR Code" className="w-[120px] h-[120px] rounded-xl" />
            </div>
            <div>
              <h4 className="font-brand text-sm text-white mb-1">Escaneie o QR Code</h4>
              <p className="text-[11px] text-zinc-400 leading-normal mb-3">
                Abra a câmera do celular para abrir o app instantaneamente no seu smartphone.
              </p>
              <button 
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold active:scale-95 transition-all cursor-pointer"
              >
                <Copy size={12} /> {copiedLink ? 'Link copiado! 🔥' : 'Copiar link do App'}
              </button>
            </div>
          </div>

          <div className="space-y-3.5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] mt-0.5 font-bold flex-shrink-0">✓</div>
              <p className="text-xs text-zinc-400"><strong className="text-zinc-200">Layout Mobile:</strong> Design limpo, ágil e feito sob medida para seu celular.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] mt-0.5 font-bold flex-shrink-0">✓</div>
              <p className="text-xs text-zinc-400"><strong className="text-zinc-200">Pedidos WhatsApp:</strong> Envio instantâneo formatado direto para nossa equipe de vendas.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] mt-0.5 font-bold flex-shrink-0">✓</div>
              <p className="text-xs text-zinc-400"><strong className="text-zinc-200">Rastreio em Tempo Real:</strong> Assista o progresso da sua entrega de forma intuitiva.</p>
            </div>
          </div>

          {/* Dev/Supervisory Bypass link */}
          <div className="border-t border-purple-500/10 pt-4 flex justify-between items-center flex-wrap gap-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Desenvolvedor / Testes:</span>
            <button 
              onClick={() => setUseSimulator(true)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-purple-400 transition-colors font-semibold uppercase tracking-wider cursor-pointer"
            >
              Simular no Computador <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendering logic depending on desktop vs mobile
  if (isDesktop && !useSimulator) {
    return renderDesktopLanding();
  }

  if (isDesktop && useSimulator) {
    return (
      <div className="min-h-screen bg-[#080112] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Glow ambient background of simulator screen */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Desktop Phone Mock frame container */}
        <div className="relative w-[385px] h-[795px] rounded-[52px] border-[14px] border-zinc-800 bg-[#0c0118] shadow-[0_0_50px_rgba(139,47,201,0.15)] flex flex-col overflow-hidden z-10">
          
          {/* Mock Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-zinc-900 rounded-full mb-1"></div>
          </div>
          
          {/* Simulated Time & Power Status Bar */}
          <div className="h-11 bg-[#0c0118]/85 backdrop-blur-md flex items-center justify-between px-7 text-[10px] font-bold text-zinc-400 select-none pt-3 z-40 flex-shrink-0">
            <span>12:00</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-zinc-500 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-zinc-500 rounded-3xs"></div>
              </div>
            </div>
          </div>

          {/* Embedded Core Application */}
          <div className="flex-1 overflow-hidden relative flex flex-col text-left">
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0118]">
              {renderAppCore()}
            </div>
          </div>

          {/* Simulated Home Indicator footer bar */}
          <div className="h-6 bg-[#0c0118] flex items-center justify-center pb-1.5 z-40 flex-shrink-0">
            <div className="w-24 h-1 bg-zinc-600 rounded-full"></div>
          </div>
        </div>

        {/* Control bar below frame */}
        <div className="mt-4 z-20 flex gap-4 text-xs font-semibold">
          <button 
            onClick={() => setUseSimulator(false)}
            className="text-zinc-400 hover:text-purple-400 transition-colors uppercase tracking-widest text-[10px] cursor-pointer"
          >
            ← Voltar ao Bloqueio
          </button>
          <span className="text-zinc-600">|</span>
          <span className="text-purple-400 tracking-wider">Modo de Simulação Ativo 📱</span>
        </div>
      </div>
    );
  }

  // Pure Mobile Layout — h-full inherits 100dvh from #root in CSS
  // This is the PWA fix: no more hidden content behind browser chrome
  return (
    <div className={`h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#0c0118] text-white' : 'bg-[#f3f0f7] text-[#1a0030]'}`}>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col shadow-2xl relative overflow-hidden">
        {renderAppCore()}
      </div>
    </div>
  );
}
