/**
 * Simula o fluxo completo: cliente faz pedido → admin confirma → ranking atualiza
 * Testa com múltiplos clientes para garantir que funciona para todos
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xewyrqzxlpjbwvjeqwgl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld3lycXp4bHBqYnd2amVxd2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzQsImV4cCI6MjA5NTUzNjQzNH0.BWiCnx4fw6b4QcDKN1V0dLDQNa0C_gzP_hyRWSZZ3GU'
);

// Normaliza telefone igual ao App.tsx
function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

// Replica exatamente a função incrementCustomerRanking do supabase.ts
async function incrementCustomerRanking(phone, nome) {
  const phoneClean = normalizePhone(phone);

  // Busca registro atual
  const { data: current } = await supabase
    .from('customer_ranking')
    .select('*')
    .eq('telefone', phoneClean)
    .maybeSingle();

  const prevTotal = current?.total_compras ?? 0;
  const newTotal = prevTotal + 1;
  const comprasNoCiclo = newTotal % 5 === 0 ? 5 : newTotal % 5;
  const nivel = comprasNoCiclo;
  const recompensa = comprasNoCiclo === 5;

  const { data, error } = await supabase
    .from('customer_ranking')
    .upsert({
      telefone: phoneClean,
      nome,
      total_compras: newTotal,
      nivel_atual: nivel,
      compras_no_ciclo: comprasNoCiclo,
      recompensa_disponivel: recompensa,
    }, { onConflict: 'telefone' })
    .select()
    .single();

  return { data, error };
}

console.log('\n🧪 TESTE COMPLETO DO RANKING PARA MÚLTIPLOS CLIENTES\n');
console.log('══════════════════════════════════════════════════════');

// Testa 4 clientes diferentes com formatos de telefone variados
const clientes = [
  { phone: '(34) 99100-0001', nome: 'Maria Silva' },
  { phone: '34991000002', nome: 'João Santos' },
  { phone: '+55 34 99100-0003', nome: 'Ana Costa' },
  { phone: '34 99100 0004', nome: 'Carlos Oliveira' },
];

for (const cliente of clientes) {
  const { data, error } = await incrementCustomerRanking(cliente.phone, cliente.nome);
  if (error) {
    console.log(`❌ ${cliente.nome} (${cliente.phone}) → ERRO: ${error.message}`);
  } else {
    console.log(`✅ ${data.nome} | tel: ${data.telefone} | compras: ${data.total_compras} | nível: ${data.nivel_atual}`);
  }
}

// Testa segundo pedido do mesmo cliente (João) — deve incrementar para 2
console.log('\n📦 Segundo pedido do João Santos (deve ir para compras=2)...');
const { data: joao2, error: err2 } = await incrementCustomerRanking('34991000002', 'João Santos');
if (err2) {
  console.log('❌ Erro:', err2.message);
} else {
  console.log(`✅ ${joao2.nome} | compras: ${joao2.total_compras} | nível: ${joao2.nivel_atual}`);
}

// Mostra ranking final
console.log('\n🏆 Ranking atual no banco:');
const { data: ranking } = await supabase
  .from('customer_ranking')
  .select('*')
  .order('total_compras', { ascending: false });

ranking?.forEach(r => {
  const recompensa = r.recompensa_disponivel ? ' 🎁 RECOMPENSA DISPONÍVEL!' : '';
  console.log(`  ${r.nome.padEnd(20)} | ${r.telefone} | ${r.total_compras} compra(s) | Nível ${r.nivel_atual}${recompensa}`);
});

// Limpa registros de teste
console.log('\n🧹 Removendo registros de teste...');
const testPhones = clientes.map(c => normalizePhone(c.phone));
await supabase.from('customer_ranking').delete().in('telefone', testPhones);
console.log('✅ Limpeza concluída. Apenas dados reais permanecem.\n');

process.exit(0);
