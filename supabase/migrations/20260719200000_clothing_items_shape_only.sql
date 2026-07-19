begin;

-- Earned clothing should change only the garment SHAPE and keep the student's
-- chosen colour (kids can already colour anything for free — a forced signature
-- colour felt like a bug). Strip the colour keys from every top/bottom/footwear
-- item's metadata, leaving just the slot + garment style. Idempotent.
update public.economy_items
set metadata = metadata - 'shirt' - 'shirtTrim' - 'pants' - 'shoes'
where metadata->>'slot' in ('top', 'bottom', 'footwear');

commit;
