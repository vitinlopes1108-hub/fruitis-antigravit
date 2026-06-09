/**
 * SCRIPT DE INSERÇÃO EM MASSA DE ESTOQUE
 * ========================================
 * Apaga todos os produtos de teste e insere os 7 modelos reais
 * com sabores, preços e quantidades de estoque.
 *
 * Execução: node bulk_stock_update.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xewyrqzxlpjbwvjeqwgl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld3lycXp4bHBqYnd2amVxd2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzQsImV4cCI6MjA5NTUzNjQzNH0.BWiCnx4fw6b4QcDKN1V0dLDQNa0C_gzP_hyRWSZZ3GU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── PRODUTOS COMPLETOS ────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'Nikbar 10K',
    badge: '10.000 PUFFS',
    description: 'Pod descartável compacto • Sabores gelados intensos',
    flavors: [
      { id: 101, name: 'Grape Ice',                    price: 79.90, emoji: '🍇', color: '#7b1fa2', stock: 2,  active: true },
      { id: 102, name: 'Watermelon Ice',               price: 79.90, emoji: '🍉', color: '#e53935', stock: 3,  active: true },
      { id: 103, name: 'Strawberry Kiwi',              price: 79.90, emoji: '🥝', color: '#43a047', stock: 2,  active: true },
      { id: 104, name: 'Strawberry Apple Watermelon Ice', price: 79.90, emoji: '🍓', color: '#e91e63', stock: 4, active: true },
      { id: 105, name: 'Grape Apple Ice',              price: 79.90, emoji: '🍏', color: '#558b2f', stock: 3,  active: true },
      { id: 106, name: 'Miami Mint',                   price: 79.90, emoji: '🌊', color: '#00838f', stock: 1,  active: true },
      { id: 107, name: 'Menthol',                      price: 79.90, emoji: '🌿', color: '#00897b', stock: 2,  active: true },
    ],
  },
  {
    name: 'Elfbar BC 15K',
    badge: '15.000 PUFFS',
    description: 'Pod descartável recarregável • Alta durabilidade',
    flavors: [
      { id: 201, name: 'Café Ice',               price: 89.90, emoji: '☕', color: '#6d4c41', stock: 12, active: true },
      { id: 202, name: 'Bubbaloo Grape',          price: 89.90, emoji: '🫧', color: '#8e24aa', stock: 7,  active: true },
      { id: 203, name: 'Peach Mango Watermelon',  price: 89.90, emoji: '🍑', color: '#fb8c00', stock: 7,  active: true },
      { id: 204, name: 'Strawberry Kiwi',         price: 89.90, emoji: '🥝', color: '#43a047', stock: 8,  active: true },
      { id: 205, name: 'Hawai Popsicle',          price: 89.90, emoji: '🍍', color: '#f9a825', stock: 2,  active: true },
      { id: 206, name: 'Miami Mint',              price: 89.90, emoji: '🌊', color: '#00838f', stock: 1,  active: true },
    ],
  },
  {
    name: 'Ignite V155',
    badge: 'PREMIUM',
    description: 'Pod de alta performance • Sabor intenso',
    flavors: [
      { id: 301, name: 'Watermelon Mix',    price: 109.90, emoji: '🍉', color: '#e53935', stock: 3, active: true },
      { id: 302, name: 'Strawberry Ice',    price: 109.90, emoji: '🍓', color: '#c62828', stock: 3, active: true },
      { id: 303, name: 'Strawberry Banana', price: 109.90, emoji: '🍌', color: '#f9a825', stock: 2, active: true },
    ],
  },
  {
    name: 'Lost Mary Dura 35K',
    badge: '35.000 PUFFS',
    description: 'Ultra resistente • Maior duração do mercado',
    flavors: [
      { id: 401, name: 'Grape Fruit Passion',    price: 109.90, emoji: '🍇', color: '#8e24aa', stock: 6, active: true },
      { id: 402, name: 'Grape Ice',              price: 109.90, emoji: '🍇', color: '#7b1fa2', stock: 6, active: true },
      { id: 403, name: 'Menthol',                price: 109.90, emoji: '🌿', color: '#00897b', stock: 2, active: true },
      { id: 404, name: 'Strawberry Kiwi',        price: 109.90, emoji: '🥝', color: '#43a047', stock: 1, active: true },
      { id: 405, name: 'Strawberry Watermelon',  price: 109.90, emoji: '🍉', color: '#e53935', stock: 2, active: true },
      { id: 406, name: 'Hawaiian Juice',          price: 109.90, emoji: '🌺', color: '#f4511e', stock: 3, active: true },
      { id: 407, name: 'Strawberry Ice',         price: 109.90, emoji: '🍓', color: '#e91e63', stock: 1, active: true },
    ],
  },
  {
    name: 'Black Sheep 40K',
    badge: '2 SABORES EM 1',
    description: 'Dois sabores em um único pod • 40.000 puffs',
    flavors: [
      { id: 501, name: 'Blueberry Grape / Cherry Berry', price: 149.90, emoji: '🫐', color: '#3949ab', stock: 1, active: true },
    ],
  },
  {
    name: 'Elfbar Ice King 40K',
    badge: '40.000 PUFFS',
    description: 'King da gelada • Ultra refrescante',
    flavors: [
      { id: 601, name: 'Dragon Strawnana',      price: 139.90, emoji: '🐉', color: '#d32f2f', stock: 3, active: true },
      { id: 602, name: 'Green Apple Slush',     price: 139.90, emoji: '🍏', color: '#7cb342', stock: 3, active: true },
      { id: 603, name: 'Strawberry Watermelon', price: 139.90, emoji: '🍓', color: '#e91e63', stock: 2, active: true },
      { id: 604, name: 'Passion Flash',         price: 139.90, emoji: '🌺', color: '#f06292', stock: 1, active: true },
      { id: 605, name: 'Peach Blue Slush',      price: 139.90, emoji: '🍑', color: '#ff8f00', stock: 2, active: true },
      { id: 606, name: 'Black Mint',            price: 139.90, emoji: '⬛', color: '#424242', stock: 2, active: true },
      { id: 607, name: 'Strawberry Ice',        price: 139.90, emoji: '🍓', color: '#c62828', stock: 1, active: true },
    ],
  },
  {
    name: 'Elfbar RAB Beats 50K',
    badge: '50.000 PUFFS',
    description: 'O mais duradouro • Beats Edition',
    flavors: [
      { id: 701, name: 'Icy Mint',       price: 149.90, emoji: '❄️', color: '#0288d1', stock: 6, active: true },
      { id: 702, name: 'Sakura Grape',   price: 149.90, emoji: '🌸', color: '#ad1457', stock: 4, active: true },
      { id: 703, name: 'Triple Berry',   price: 149.90, emoji: '🫐', color: '#4527a0', stock: 4, active: true },
      { id: 704, name: 'Watermelon Ice', price: 149.90, emoji: '🍉', color: '#388e3c', stock: 6, active: true },
    ],
  },
];

// ─── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗑️  Apagando todos os produtos existentes (dados de teste)...');

  const { error: deleteError } = await supabase
    .from('produtos')
    .delete()
    .neq('id', 0); // deleta tudo

  if (deleteError) {
    console.error('❌ Erro ao apagar produtos:', deleteError.message);
    process.exit(1);
  }

  console.log('✅ Produtos antigos apagados!\n');
  console.log('📦 Inserindo os 7 modelos reais...\n');

  let successCount = 0;
  let totalFlavors = 0;

  for (const product of PRODUCTS) {
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        name:        product.name,
        badge:       product.badge,
        description: product.description,
        flavors:     product.flavors,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao inserir "${product.name}":`, error.message);
      continue;
    }

    successCount++;
    totalFlavors += product.flavors.length;

    const totalStock = product.flavors.reduce((sum, f) => sum + (f.stock || 0), 0);
    console.log(`✅ [ID: ${data.id}] ${product.name} — ${product.flavors.length} sabores — ${totalStock} unidades no total`);
    product.flavors.forEach(f => {
      console.log(`   • ${f.emoji} ${f.name.padEnd(35)} ${f.stock} un.  @ R$${f.price.toFixed(2)}`);
    });
    console.log('');
  }

  console.log('══════════════════════════════════════════════════════');
  console.log('🎉 INSERÇÃO CONCLUÍDA!');
  console.log(`   📦 Modelos inseridos:  ${successCount}/${PRODUCTS.length}`);
  console.log(`   🍬 Total de sabores:   ${totalFlavors}`);
  const grandTotal = PRODUCTS.flatMap(p => p.flavors).reduce((s, f) => s + (f.stock || 0), 0);
  console.log(`   📊 Total em estoque:   ${grandTotal} unidades`);
  console.log('══════════════════════════════════════════════════════');
}

main().catch(console.error);
