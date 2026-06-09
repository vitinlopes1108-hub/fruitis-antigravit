/**
 * Backfill: incrementa o ranking para todos os pedidos que já têm status 'chegou'
 * mas que ainda não foram contabilizados no customer_ranking
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xewyrqzxlpjbwvjeqwgl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld3lycXp4bHBqYnd2amVxd2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzQsImV4cCI6MjA5NTUzNjQzNH0.BWiCnx4fw6b4QcDKN1V0dLDQNa0C_gzP_hyRWSZZ3GU'
);

// Busca todos os pedidos com status 'chegou'
const { data: pedidos, error } = await supabase
  .from('pedidos_v2')
  .select('id, nome, telefone, status')
  .eq('status', 'chegou')
  .order('created_at', { ascending: true });

if (error) {
  console.error('Erro ao buscar pedidos:', error.message);
  process.exit(1);
}

console.log(`\n📦 ${pedidos.length} pedido(s) com status "chegou" encontrado(s)\n`);

// Agrupa por telefone para contar compras
const byPhone = {};
for (const p of pedidos) {
  const phone = p.telefone.replace(/\D/g, '');
  if (!byPhone[phone]) {
    byPhone[phone] = { nome: p.nome || p.telefone, count: 0 };
  }
  byPhone[phone].count++;
}

// Para cada cliente, faz upsert com o total de compras
for (const [phone, info] of Object.entries(byPhone)) {
  const total = info.count;
  const comprasNoCiclo = total % 5 === 0 ? 5 : total % 5;
  const nivel = comprasNoCiclo;
  const recompensa = comprasNoCiclo === 5;

  const { data, error: upsertErr } = await supabase
    .from('customer_ranking')
    .upsert({
      telefone: phone,
      nome: info.nome,
      total_compras: total,
      nivel_atual: nivel,
      compras_no_ciclo: comprasNoCiclo,
      recompensa_disponivel: recompensa,
    }, { onConflict: 'telefone' })
    .select()
    .single();

  if (upsertErr) {
    console.error(`❌ Erro para ${phone}:`, upsertErr.message);
  } else {
    console.log(`✅ ${phone} (${info.nome}) → ${total} compra(s) | Nível ${nivel} | Recompensa: ${recompensa}`);
  }
}

// Resultado final
const { data: final } = await supabase.from('customer_ranking').select('*').order('total_compras', { ascending: false });
console.log(`\n🏆 Ranking final (${final.length} cliente(s)):`);
final?.forEach(r => {
  console.log(`  ${r.nome} | ${r.telefone} | Compras: ${r.total_compras} | Nível: ${r.nivel_atual} | 🎁 ${r.recompensa_disponivel ? 'RECOMPENSA!' : '-'}`);
});

process.exit(0);
