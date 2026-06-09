/**
 * Cria a tabela customer_ranking diretamente no Supabase usando a Management API
 */
import https from 'https';

const PROJECT_REF = 'xewyrqzxlpjbwvjeqwgl';

// Você precisa da service_role key OU rodar o SQL manualmente
// Vamos usar o SQL Editor via instrução clara

const SQL = `
-- ============================================================
-- Cria tabela de ranking de clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_ranking (
  id                    BIGSERIAL PRIMARY KEY,
  telefone              TEXT NOT NULL UNIQUE,
  nome                  TEXT,
  total_compras         INTEGER NOT NULL DEFAULT 0,
  nivel_atual           INTEGER NOT NULL DEFAULT 0,
  compras_no_ciclo      INTEGER NOT NULL DEFAULT 0,
  recompensa_disponivel BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customer_ranking_updated_at ON public.customer_ranking;
CREATE TRIGGER update_customer_ranking_updated_at
  BEFORE UPDATE ON public.customer_ranking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ativa RLS
ALTER TABLE public.customer_ranking ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "allow_all_anon" ON public.customer_ranking;
DROP POLICY IF EXISTS "public read ranking" ON public.customer_ranking;
DROP POLICY IF EXISTS "anon write ranking" ON public.customer_ranking;

-- Cria políticas de acesso público (leitura e escrita sem autenticação)
CREATE POLICY "public_read_ranking" ON public.customer_ranking
  FOR SELECT USING (true);

CREATE POLICY "public_write_ranking" ON public.customer_ranking
  FOR ALL USING (true) WITH CHECK (true);

-- Ativa Realtime para sincronização em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_ranking;

-- Verifica resultado
SELECT COUNT(*) as total_registros FROM public.customer_ranking;
`;

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         CRIAR TABELA customer_ranking NO SUPABASE       ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log('1. Abra este link:');
console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
console.log('');
console.log('2. Cole o SQL abaixo e clique "Run":');
console.log('');
console.log('══════════════════════════════════════════════════════════');
console.log(SQL);
console.log('══════════════════════════════════════════════════════════');
