-- ================================================================
-- FRUTINHAS GELADAS — Supabase Setup Fix
-- Cole este SQL no editor: https://supabase.com/dashboard/project/xewyrqzxlpjbwvjeqwgl/sql/new
-- ================================================================

-- 1. Ativa Realtime para store_config (horário sincroniza entre devices)
alter publication supabase_realtime add table store_config;

-- 2. Garante RLS correto para store_config (leitura e escrita públicas)
alter table store_config enable row level security;

drop policy if exists "public read store_config" on store_config;
create policy "public read store_config" on store_config
  for select using (true);

drop policy if exists "anon write store_config" on store_config;
create policy "anon write store_config" on store_config
  for all using (true) with check (true);

-- 3. Garante que existe a linha de config (cria se não existir)
insert into store_config (id, abertura, fechamento, loja_aberta)
values (1, '09:00', '22:00', true)
on conflict (id) do nothing;

-- 4. Garante RLS correto para customer_ranking
alter table customer_ranking enable row level security;

drop policy if exists "public read ranking" on customer_ranking;
create policy "public read ranking" on customer_ranking
  for select using (true);

drop policy if exists "anon write ranking" on customer_ranking;
create policy "anon write ranking" on customer_ranking
  for all using (true) with check (true);

-- 5. Ativa Realtime para customer_ranking (ranking atualiza em tempo real)
alter publication supabase_realtime add table customer_ranking;

-- Verificação: mostra tabelas com Realtime ativo
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;
