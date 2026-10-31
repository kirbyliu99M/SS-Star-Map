-- S0-4：啟用必要擴充。PGroonga 留到 S1 spike ③ 再啟用（docs/plans/2026-11-01-s0-s1-plan.md）。

-- pgvector：語意搜尋（PRD §14.3，P5 才用，先啟用以固定 schema 位置）
create extension if not exists vector with schema extensions;

-- pg_cron＋pg_net：每小時排程呼叫 Edge Functions（PRD §16.5）
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
