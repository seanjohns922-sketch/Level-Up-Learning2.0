-- Stop selling the old Trampoline Park now that the premium Trampoline (with four levels and a real
-- bounce) replaces it, so the shop doesn't offer two trampolines. Anyone who owns one keeps it and can
-- still place it: ownership lives in student_inventory and the world only checks ownership to place.
-- Rollback: update public.economy_items set purchasable = true where item_key = 'central_world_plot_6_trampoline_park';
begin;
update public.economy_items
set purchasable = false
where item_key = 'central_world_plot_6_trampoline_park';
commit;
