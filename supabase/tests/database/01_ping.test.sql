-- S0-4b：ping() 給 anon 呼叫，只回傳時間。
begin;
select plan(2);

select has_function('public', 'ping', array[]::text[], 'public.ping() 存在');
select function_privs_are('public', 'ping', array[]::text[], 'anon', array['EXECUTE'], 'anon 可以執行 ping()');

select * from finish();
rollback;
