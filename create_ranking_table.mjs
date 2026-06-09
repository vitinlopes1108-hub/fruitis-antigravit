/**
 * Cria a tabela customer_ranking via Supabase REST API (pg_dump approach)
 * Usa a API de SQL do Supabase Management API
 */
import https from 'https';

// Extraindo o project ref da URL
const PROJECT_REF = 'xewyrqzxlpjbwvjeqwgl';

const SQL = `
CREATE TABLE IF NOT EXISTS customer_ranking (
  id                    BIGSERIAL PRIMARY KEY,
  telefone              TEXT NOT NULL UNIQUE,
  nome                  TEXT,
  total_compras         INTEGER NOT NULL DEFAULT 0,
  nivel_atual           INTEGER NOT NULL DEFAULT 0,
  compras_no_ciclo      INTEGER NOT NULL DEFAULT 0,
  recompensa_disponivel BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customer_ranking' AND policyname = 'allow_all_anon'
  ) THEN
    ALTER TABLE customer_ranking ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_anon ON customer_ranking FOR ALL USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;
`;

console.log('');
console.log('❌ A chave anon não tem permissão para criar tabelas (DDL).');
console.log('');
console.log('📋 Por favor, acesse o link abaixo e execute o SQL:');
console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
console.log('');
console.log('══════════════════════════════════════════════════════════');
console.log('COLE ESTE SQL E CLIQUE EM "RUN":');
console.log('══════════════════════════════════════════════════════════');
console.log(SQL);
console.log('══════════════════════════════════════════════════════════');
console.log('');
console.log('Após executar, rode: node create_ranking_table.mjs novamente para confirmar.');
