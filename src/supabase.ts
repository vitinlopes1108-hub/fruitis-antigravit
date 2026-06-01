import { createClient } from '@supabase/supabase-js';
import { Product, Order } from './types';

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
    flavors: Array.isArray(row.flavors) ? row.flavors : [],
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
    // Update existing
    const { data, error } = await supabase
      .from('produtos')
      .update(payload)
      .eq('id', product.id)
      .select()
      .single();

    if (error) { console.error('Erro ao atualizar produto:', error); return null; }
    return { ...product, ...data, flavors: data.flavors };
  } else {
    // Insert new
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
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
  }));
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
