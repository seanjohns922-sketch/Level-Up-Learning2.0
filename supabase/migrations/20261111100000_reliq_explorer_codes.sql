begin;

-- New Explorer Codes use the RELIQ prefix (RLQ-XXXX-XXXX). Existing LUL codes
-- are never changed: families have linked with them and some are printed, so
-- both prefixes stay valid. Lookups compare the normalised code, so login and
-- parent linking accept either. Installation changes no existing codes.
alter table public.student_explorer_codes
  drop constraint if exists student_explorer_codes_code_format_check;
alter table public.student_explorer_codes
  add constraint student_explorer_codes_code_format_check check (
    code ~ '^(LUL|RLQ)-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'
    and code_normalised = replace(code, '-', '')
  );

create or replace function public.generate_explorer_code_candidate()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_bytes bytea;
  v_body text := '';
  v_index integer;
begin
  while length(v_body) < 8 loop
    v_bytes := extensions.gen_random_bytes(16);
    for v_index in 0..15 loop
      -- Reject the upper eight byte values so modulo 31 is unbiased.
      if get_byte(v_bytes, v_index) < 248 then
        v_body := v_body || substr(
          v_alphabet,
          (get_byte(v_bytes, v_index) % length(v_alphabet)) + 1,
          1
        );
      end if;
      exit when length(v_body) = 8;
    end loop;
  end loop;

  return 'RLQ-' || substr(v_body, 1, 4) || '-' || substr(v_body, 5, 4);
end;
$$;

revoke all on function public.generate_explorer_code_candidate()
  from public, anon, authenticated;

commit;
