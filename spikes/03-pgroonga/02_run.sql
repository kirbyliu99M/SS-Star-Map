-- 查詢端切詞：ASCII 連續字串整段保留；CJK 連續字串切成重疊 2-gram（單字則保留單字）。
create function spike.grams(q text) returns text[] language plpgsql immutable as $$
declare r text[] := '{}'; m text[]; run text; i int;
begin
  for m in select regexp_matches(lower(q), '[a-z0-9][a-z0-9.\-]*', 'g') loop r := r || m[1]; end loop;
  for run in select (regexp_matches(regexp_replace(lower(q), '[a-z0-9.\-\s[:punct:]]+', ' ', 'g'), '\S+', 'g'))[1] loop
    if char_length(run) = 1 then r := r || run;
    else for i in 1 .. char_length(run) - 1 loop r := r || substr(run, i, 2); end loop;
    end if;
  end loop;
  return r;
end $$;

-- 同義詞擴展：查詢字串含有某別名（或標籤名）→ 該標籤的 offers
create function spike.syn_ids(q text) returns int[] language sql stable as $$
  select coalesce(array_agg(distinct ot.offer_id), '{}')
  from (select alias, tag_id from spike.tag_aliases union select lower(name), id from spike.tags) a
  join spike.offer_tags ot on ot.tag_id = a.tag_id
  where position(a.alias in lower(q)) > 0
$$;

create table spike.configs (cfg int primary key, label text, tokenizer text, normalizer text);
insert into spike.configs values
(1,'TokenBigram + NormalizerAuto（預設）','TokenBigram','NormalizerAuto'),
(2,'TokenBigram + NFKC150','TokenBigram','NormalizerNFKC150'),
(3,'TokenBigramSplitSymbolAlphaDigit + NFKC150','TokenBigramSplitSymbolAlphaDigit','NormalizerNFKC150'),
(4,'TokenNgram(unify_alphabet=false, unify_digit=false) + NFKC150','TokenNgram("unify_alphabet", false, "unify_digit", false)','NormalizerNFKC150'),
(5,'TokenNgram(n=3) + NFKC150（對照組）','TokenNgram("n", 3)','NormalizerNFKC150'),
(6,'TokenNgram(unify_alphabet=false, unify_digit=false) + NFKC150(unify_kana)','TokenNgram("unify_alphabet", false, "unify_digit", false)','NormalizerNFKC150("unify_kana", true)');

do $$ declare c record; begin
  for c in select * from spike.configs loop
    execute format('create table spike.o%s as select id, body from spike.offers', c.cfg);
    execute format($f$create index on spike.o%s using pgroonga (body) with (tokenizer=%L, normalizers=%L)$f$, c.cfg, c.tokenizer, c.normalizer);
  end loop;
end $$;
set enable_seqscan = off;  -- 強制走 PGroonga index，避免小表退回 seq scan

-- mode: F=整句 keyword（&@）、G=查詢切 2-gram 後 OR（&@|）、S=只用同義詞、
--       FS／GS=同義詞標籤命中排最前，再接全文分數
create function spike.search(cfg int, mode text, q text) returns int[] language plpgsql as $$
declare ft text; res int[]; use_syn boolean := mode in ('S','FS','GS');
begin
  if mode in ('F','FS') then
    ft := format('select id, pgroonga_score(tableoid, ctid) s from spike.o%s where body &@ $1', cfg);
  elsif mode in ('G','GS') then
    ft := format('select id, pgroonga_score(tableoid, ctid) s from spike.o%s where body &@| spike.grams($1)', cfg);
  else
    ft := 'select null::int id, null::float8 s where false';
  end if;
  execute format($f$select coalesce(array_agg(id order by tg desc, s desc nulls last, id), '{}') from (
      select coalesce(f.id, t.id) id, f.s s, (t.id is not null) tg
      from (%s) f full join (select unnest($2) id) t on t.id = f.id) x$f$, ft)
    using q, case when use_syn then spike.syn_ids(q) else '{}'::int[] end into res;
  return res[1:5];
end $$;

create table spike.res as
select c.cfg, m.mode, qu.qid, qu.kind, qu.expected, spike.search(c.cfg, m.mode, qu.q) top5
from spike.configs c cross join (values ('F'),('G'),('S'),('FS'),('GS')) m(mode) cross join spike.queries qu
where not (m.mode = 'S' and c.cfg > 1);  -- S 與 tokenizer 無關，只算一次

\echo === hit@5 / hit@1 / 全排名指紋（每組 30 句）===
select cfg, mode,
  count(*) filter (where top5 && expected) as hit5,
  count(*) filter (where top5[1] = any(expected)) as hit1,
  md5(string_agg(qid || ':' || coalesce(top5::text,''), ',' order by qid)) as fingerprint
from spike.res group by cfg, mode order by cfg, mode;

\echo === 各類型 hit@5（exact10 / colloquial8 / synonym8 / partial4）===
select cfg, mode,
  count(*) filter (where kind='exact' and top5 && expected) as exact10,
  count(*) filter (where kind='colloquial' and top5 && expected) as colloq8,
  count(*) filter (where kind='synonym' and top5 && expected) as syn8,
  count(*) filter (where kind='partial' and top5 && expected) as part4
from spike.res group by cfg, mode order by cfg, mode;

\echo === 驗證 index 真的被使用（cfg 2）===
explain (costs off) select id from spike.o2 where body &@ '剪片';

\echo === 未命中清單（指定 cfg/mode）===
select qid, kind, (select q from spike.queries where qid = r.qid) q, expected, top5
from spike.res r where cfg = :miss_cfg and mode = :'miss_mode' and not (top5 && expected) order by qid;
