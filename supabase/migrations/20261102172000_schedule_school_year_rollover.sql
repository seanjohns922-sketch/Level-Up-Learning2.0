-- Daily retry means no school is missed if the New Year run is interrupted.
-- Only schools explicitly configured/enabled by an administrator are processed.
-- 16:15 UTC is after midnight across Australia (03:15 Melbourne in January).
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('reliq-school-year-rollover','15 16 * * *',
  'select public.run_school_year_rollover();');
