ALTER TABLE public.complaints DROP CONSTRAINT complaints_type_check;
ALTER TABLE public.complaints ADD CONSTRAINT complaints_type_check CHECK (type = ANY (ARRAY['civic'::text, 'anonymous'::text, 'special'::text]));
