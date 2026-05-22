begin;

drop policy if exists "Anyone can lookup class by code" on public.classes;

create policy "Anyone can lookup class by code"
on public.classes
for select
to anon, authenticated
using (true);

commit;
