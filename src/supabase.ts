import { createClient } from '@supabase/supabase-js';
import { Product, Order, CartItem } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    badge: row.badge || '',
    description: row.description || '',
    flavors: (Array.isArray(row.flavors) ? row.flavors : []).map((f: any) => ({
      id: f.id,
      name: f.name,
      price: f.price,
      emoji: f.emoji,
      color: f.color,
      stock: f.stock ?? null,
      active: f.active !== false, // default true
    })),
  }));
}

export async function upsertProduct(product: Product): Promise<Product | null> {
  const payload = {
    name: product.name,
    badge: product.badge,
    description: product.description,
    flavors: product.flavors,
  };

  if (product.id && product.id > 0) {
    const { data, error } = await supabase
      .from('produtos')
      .update(payload)
      .eq('id', product.id)
      .select()
      .single();

    if (error) { console.error('Erro ao atualizar produto:', error); return null; }
    return { ...product, ...data, flavors: data.flavors };
  } else {
    const { data, error } = await supabase
      .from('produtos')
      .insert(payload)
      .select()
      .single();

    if (error) { console.error('Erro ao inserir produto:', error); return null; }
    return { ...product, id: data.id, flavors: data.flavors };
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar produto:', error); return false; }
  return true;
}

// ── ORDERS ───────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('pedidos_v2')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 999);

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }

  return (data || []).map(mapRowToOrder);
}

export async function fetchOrdersByPhone(phone: string): Promise<Order[]> {
  const cleaned = phone.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('pedidos_v2')
    .select('*')
    .eq('telefone', phone)
    .order('created_at', { ascending: false })
    .range(0, 99);

  // Try with raw number if formatted didn't match
  if ((!data || data.length === 0) && cleaned !== phone) {
    const { data: data2, error: error2 } = await supabase
      .from('pedidos_v2')
      .select('*')
      .eq('telefone', cleaned)
      .order('created_at', { ascending: false })
      .range(0, 99);
    if (!error2 && data2) return data2.map(mapRowToOrder);
  }

  if (error) { console.error('Erro ao buscar pedidos por telefone:', error); return []; }
  return (data || []).map(mapRowToOrder);
}

export async function insertOrder(order: Order): Promise<Order | null> {
  const { data, error } = await supabase
    .from('pedidos_v2')
    .insert({
      nome: order.name,
      telefone: order.phone,
      endereco: order.address,
      bairro: order.neighborhood,
      cidade: order.city,
      complemento: order.complement || null,
      pagamento: order.payment,
      troco: order.change,
      itens: order.items,
      subtotal: order.subtotal,
      total: order.total,
      status: 'pendente',
    })
    .select()
    .single();

  if (error) { console.error('Erro ao inserir pedido:', error); return null; }

  return {
    ...order,
    id: data.id,
    date: new Date(data.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  };
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('pedidos_v2')
    .update({ status })
    .eq('id', id);

  if (error) { console.error('Erro ao atualizar status do pedido:', error); return false; }
  return true;
}

export async function deleteOrder(id: number): Promise<boolean> {
  const { error } = await supabase.from('pedidos_v2').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar pedido:', error); return false; }
  return true;
}

// ── STOCK ────────────────────────────────────────────────────────────────────

export async function decrementStock(
  items: CartItem[],
  products: Product[]
): Promise<void> {
  // Group items by productId and build updated products
  const updatedProducts: Product[] = products.map((product) => {
    const hasItems = items.some((i) => i.productId === product.id);
    if (!hasItems) return product;

    return {
      ...product,
      flavors: product.flavors.map((flavor) => {
        const item = items.find(
          (i) => i.productId === product.id && i.flavorId === flavor.id
        );
        if (!item || flavor.stock === null) return flavor;
        return {
          ...flavor,
          stock: Math.max(0, (flavor.stock ?? 0) - item.qty),
        };
      }),
    };
  });

  // Persist only changed products
  for (const product of updatedProducts) {
    const original = products.find((p) => p.id === product.id);
    if (original && JSON.stringify(original.flavors) !== JSON.stringify(product.flavors)) {
      await upsertProduct(product);
    }
  }
}

// ── AUDIT LOG ────────────────────────────────────────────────────────────────

export async function logAudit(
  action: string,
  targetId: number,
  details: object
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    action,
    target_id: targetId,
    details,
  });
  if (error) console.error('Erro ao registrar auditoria:', error);
}

// ── REALTIME ─────────────────────────────────────────────────────────────────

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    date: new Date(row.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    name: row.nome,
    phone: row.telefone,
    address: row.endereco,
    neighborhood: row.bairro,
    city: row.cidade,
    complement: row.complemento,
    payment: row.pagamento,
    change: row.troco,
    items: Array.isArray(row.itens) ? row.itens : [],
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status || 'pendente',
  };
}

export function subscribeToNewOrders(callback: (order: Order) => void) {
  const channel = supabase
    .channel('realtime-pedidos')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pedidos_v2' },
      (payload) => {
        callback(mapRowToOrder(payload.new));
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToOrderStatus(orderId: number, callback: (status: string) => void) {
  const channel = supabase
    .channel(`order-status-${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pedidos_v2', filter: `id=eq.${orderId}` },
      (payload) => {
        const newStatus = payload.new?.status;
        if (newStatus) callback(newStatus);
      }
    )
    .subscribe();

  return channel;
}
