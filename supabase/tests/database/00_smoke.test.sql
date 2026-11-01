-- S0-4 smoke test：確認必要擴充已啟用。
begin;
select plan(4);

select has_extension('vector', 'pgvector 已啟用');
select has_extension('pg_cron', 'pg_cron 已啟用');
select has_extension('pg_net', 'pg_net 已啟用');
select has_extension('pgroonga', 'pgroonga 已啟用');

select * from finish();
rollback;
