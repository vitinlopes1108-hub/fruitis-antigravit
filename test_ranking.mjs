import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xewyrqzxlpjbwvjeqwgl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld3lycXp4bHBqYnd2amVxd2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzQsImV4cCI6MjA5NTUzNjQzNH0.BWiCnx4fw6b4QcDKN1V0dLDQNa0C_gzP_hyRWSZZ3GU'
);

console.log('\n🔍 Testando tabela customer_ranking...\n');

// 1. Testa leitura
const { data: rows, error: readErr } = await supabase
  .from('customer_ranking')
  .select('*')
  .limit(5);

if (readErr) {
  console.error('❌ ERRO ao ler customer_ranking:', readErr.code, readErr.message);
  console.log('\n⚠️  A tabela provavelmente NÃO EXISTE. Crie ela no Supabase SQL Editor.\n');
} else {
  console.log('✅ Tabela customer_ranking EXISTS. Rows:', rows.length);
  if (rows.length > 0) {
    console.log('Dados:', JSON.stringify(rows, null, 2));
  }
}

// 2. Testa upsert (simula incrementCustomerRanking)
console.log('\n🔍 Testando upsert (incremento de ranking)...\n');
const testPhone = '34999000000';
const { data: upserted, error: upsertErr } = await supabase
  .from('customer_ranking')
  .upsert({
    telefone: testPhone,
    nome: 'Teste Node',
    total_compras: 1,
    nivel_atual: 1,
    compras_no_ciclo: 1,
    recompensa_disponivel: false,
  }, { onConflict: 'telefone' })
  .select()
  .single();

if (upsertErr) {
  console.error('❌ ERRO ao fazer upsert:', upsertErr.code, upsertErr.message);
  console.log('\nDetalhes:', JSON.stringify(upsertErr, null, 2));
} else {
  console.log('✅ Upsert funcionou! Dados:', JSON.stringify(upserted, null, 2));
  // Limpa o registro de teste
  await supabase.from('customer_ranking').delete().eq('telefone', testPhone);
  console.log('🧹 Registro de teste removido.');
}

// 3. Verifica pedidos com status chegou
console.log('\n🔍 Verificando pedidos com status chegou...\n');
const { data: pedidos, error: pedErr } = await supabase
  .from('pedidos_v2')
  .select('id, nome, telefone, status')
  .eq('status', 'chegou')
  .limit(5);

if (pedErr) {
  console.error('❌ ERRO ao ler pedidos:', pedErr.message);
} else {
  console.log(`✅ Pedidos com status "chegou": ${pedidos.length}`);
  if (pedidos.length > 0) {
    pedidos.forEach(p => console.log(`  - ID ${p.id} | ${p.nome} | ${p.telefone}`));
  }
}

process.exit(0);
