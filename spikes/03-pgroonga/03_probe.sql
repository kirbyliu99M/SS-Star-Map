-- 補充探針：30 句查不出各 tokenizer 差異，這裡專測英文片段、全形、大小寫、單字、日文假名。
-- 只用 F（整句 keyword &@）看「有幾筆 offer 命中」，與 expected 無關。
create table spike.probe (pid int primary key, q text, note text);
insert into spike.probe values
(1,'Insta','英文詞前綴（Instagram）'),
(2,'tagram','英文詞中段'),
(3,'ＳＥＯ','全形英文 vs 半形 SEO'),
(4,'seo','小寫'),
(5,'ｐｙｔｈｏｎ','全形 vs Python'),
(6,'GPT','ChatGPT 的後半'),
(7,'剪','單一 CJK 字'),
(8,'盤查','CJK 詞中段'),
(9,'iso14064','缺空白與連字號（ISO 14064-1）'),
(10,'ISO 14064-1','完整寫法'),
(11,'ｊｌｐｔ','全形 JLPT'),
(12,'ﾆﾎﾝ','半形片假名（無對應，預期 0）'),
(13,'N2','字母＋數字'),
(14,'2D','數字＋字母'),
(15,'next js','Next.js 寫成空白');

\echo === 探針：各 config 命中筆數（F 模式）===
select p.pid, p.q, p.note,
  (select count(*) from spike.o1 where body &@ p.q) as c1_auto,
  (select count(*) from spike.o2 where body &@ p.q) as c2_nfkc,
  (select count(*) from spike.o3 where body &@ p.q) as c3_split,
  (select count(*) from spike.o4 where body &@ p.q) as c4_ngram,
  (select count(*) from spike.o5 where body &@ p.q) as c5_tri,
  (select count(*) from spike.o6 where body &@ p.q) as c6_kana
from spike.probe p order by pid;
