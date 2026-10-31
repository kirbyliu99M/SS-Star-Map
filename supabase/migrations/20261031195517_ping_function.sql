-- S0-4b：staging 保活用。Supabase 免費專案 7 天低活動會暫停，ping 需要真的查詢資料庫。
-- 只回傳伺服器時間，不讀任何資料表；anon 可呼叫。
create or replace function public.ping()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
