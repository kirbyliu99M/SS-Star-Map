-- S1 spike ③：啟用 PGroonga（繁中全文搜尋，PRD §14.2）。只啟用擴充，索引與資料表留給後續 migration。
-- 放在 extensions schema，與 vector／pg_net 一致。
create extension if not exists pgroonga with schema extensions;
