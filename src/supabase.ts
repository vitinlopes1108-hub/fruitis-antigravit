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
  products: Product[],
  orderId?: number
): Promise<void> {
  // Build updated products with decremented stock
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

  // Persist changed products and log each movement
  for (const product of updatedProducts) {
    const original = products.find((p) => p.id === product.id);
    if (!original || JSON.stringify(original.flavors) === JSON.stringify(product.flavors)) continue;

    await upsertProduct(product);

    // Log each flavor stock change
    for (const flavor of product.flavors) {
      const origFlavor = original.flavors.find((f) => f.id === flavor.id);
      if (!origFlavor || origFlavor.stock === null || origFlavor.stock === flavor.stock) continue;
      const item = items.find((i) => i.productId === product.id && i.flavorId === flavor.id);
      if (!item) continue;
      await logAudit('stock_venda', product.id, {
        productName: product.name,
        flavorId: flavor.id,
        flavorName: flavor.name,
        qty: item.qty,
        before: origFlavor.stock,
        after: flavor.stock,
        orderId: orderId ?? null,
      });
    }
  }
}

export async function logStockAdjust(
  productId: number,
  productName: string,
  flavorId: number,
  flavorName: string,
  before: number | null,
  after: number | null
): Promise<void> {
  await logAudit('stock_ajuste', productId, {
    productName,
    flavorId,
    flavorName,
    before,
    after,
    adjustedAt: new Date().toISOString(),
    adjustedBy: 'admin',
  });
}

export async function fetchStockLog(limit = 40): Promise<any[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .or('action.eq.stock_venda,action.eq.stock_ajuste')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('Erro ao buscar log de estoque:', error); return []; }
  return data || [];
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

export function subscribeToProductChanges(callback: (updated: Product) => void) {
  const channel = supabase
    .channel('realtime-produtos')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'produtos' },
      (payload) => {
        const row = payload.new as any;
        const product: Product = {
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
            active: f.active !== false,
          })),
        };
        callback(product);
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

// ── CUSTOMER RANKING ─────────────────────────────────────────────────────────
// Regra: 1 compra concluída = 1 nível. Ciclo de 5. Ao atingir nível 5, recompensa
// é desbloqueada e o ciclo reinicia do nível 1 na próxima compra.

export interface CustomerRanking {
  id?: number;
  telefone: string;
  nome: string;
  total_compras: number;
  nivel_atual: number;
  compras_no_ciclo: number; // 1-5 dentro do ciclo atual
  recompensa_disponivel: boolean;
  updated_at?: string;
}

/** Calcula o estado do ranking a partir do total de compras concluídas */
export function calcRanking(totalCompras: number, recompensaDisponivel: boolean): {
  nivel: number;
  comprasNoCiclo: number;
  recompensa: boolean;
} {
  if (totalCompras === 0) return { nivel: 0, comprasNoCiclo: 0, recompensa: false };
  const comprasNoCiclo = totalCompras % 5 === 0 ? 5 : totalCompras % 5;
  const nivel = comprasNoCiclo; // 1 compra no ciclo = nível 1, ..., 5 = nível 5
  const recompensa = comprasNoCiclo === 5 || recompensaDisponivel;
  return { nivel, comprasNoCiclo, recompensa };
}

export async function fetchCustomerRanking(phone: string): Promise<CustomerRanking | null> {
  try {
    const { data, error } = await supabase
      .from('customer_ranking')
      .select('*')
      .eq('telefone', phone)
      .maybeSingle();

    if (error) {
      if ((error as any).code === 'PGRST205' || (error as any).code === '42P01') {
        // Tabela não existe ainda — retorna null silenciosamente
        return null;
      }
      console.error('Erro ao buscar ranking:', error);
      return null;
    }
    return data as CustomerRanking | null;
  } catch {
    return null;
  }
}

/**
 * Incrementa o total de compras do cliente em +1 e recalcula nível/ciclo.
 * Chamado pelo admin quando marca um pedido como 'chegou'.
 */
export async function incrementCustomerRanking(phone: string, nome: string): Promise<CustomerRanking | null> {
  try {
    // Busca o registro atual
    const current = await fetchCustomerRanking(phone);

    const prevTotal = current?.total_compras ?? 0;
    const newTotal = prevTotal + 1;

    const { nivel, comprasNoCiclo, recompensa } = calcRanking(newTotal, false);

    const payload: Omit<CustomerRanking, 'id' | 'updated_at'> = {
      telefone: phone,
      nome,
      total_compras: newTotal,
      nivel_atual: nivel,
      compras_no_ciclo: comprasNoCiclo,
      recompensa_disponivel: recompensa,
    };

    const { data, error } = await supabase
      .from('customer_ranking')
      .upsert(payload, { onConflict: 'telefone' })
      .select()
      .single();

    if (error) {
      if ((error as any).code === 'PGRST205' || (error as any).code === '42P01') return null;
      console.error('Erro ao atualizar ranking:', error);
      return null;
    }
    return data as CustomerRanking;
  } catch {
    return null;
  }
}

/** Marca a recompensa como utilizada e reinicia o ciclo */
export async function markRewardUsed(phone: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_ranking')
      .update({ recompensa_disponivel: false })
      .eq('telefone', phone);

    if (error) { console.error('Erro ao marcar recompensa usada:', error); return false; }
    return true;
  } catch {
    return false;
  }
}
