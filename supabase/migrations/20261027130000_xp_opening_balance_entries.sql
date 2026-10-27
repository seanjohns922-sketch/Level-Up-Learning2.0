-- Record the July 2026 opening XP balances in the XP history.
--
-- When the XP economy launched, wallets were given a starting balance for
-- lessons and quizzes already done (20260718111500_backfill_existing_global_xp),
-- but the history (student_economy_transactions) only got a 0-XP marker. So 49
-- wallets hold more XP than their history adds up to (5,812 XP in total on
-- 27 Oct 2026). This adds one 'opening_balance' history entry per such wallet
-- for exactly the difference, so the history matches every wallet and any
-- future mismatch is a real warning.
--
-- Schema: none. Data: inserts history rows only. Wallets are NOT changed, so
-- no student's XP balance, rank or spending changes. There are no triggers on
-- either table.
-- Safe to re-run: the fixed source key means each student gets at most one entry,
-- and only the remaining difference is recorded.
-- Rollback: delete from public.student_economy_transactions
--   where source_type = 'opening_balance' and source_key = 'july_2026_opening_balance_v1';

begin;

with ledger as (
  select student_id, coalesce(sum(xp_delta), 0) as earned
  from public.student_economy_transactions
  where transaction_type = 'earn'
  group by student_id
)
insert into public.student_economy_transactions(
  student_id, transaction_type, xp_delta, source_type, source_key, metadata
)
select
  w.student_id,
  'earn',
  w.xp_earned - coalesce(l.earned, 0),
  'opening_balance',
  'july_2026_opening_balance_v1',
  jsonb_build_object(
    'reason', 'XP from lessons and quizzes completed before the XP economy launched (July 2026)',
    'wallet_xp_earned_at_record', w.xp_earned
  )
from public.student_economy_wallets w
left join ledger l on l.student_id = w.student_id
where w.xp_earned > coalesce(l.earned, 0)
on conflict (student_id, source_type, source_key) do nothing;

commit;
