alter table public.students
add constraint students_class_pin_unique unique (class_id, pin);
