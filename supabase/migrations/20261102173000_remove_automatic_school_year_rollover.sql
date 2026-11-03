-- Rollover will be explicitly started by a school administrator.
-- Keep existing settings/history, but remove calendar-driven execution.
select cron.unschedule(jobid) from cron.job
where jobname = 'reliq-school-year-rollover';
