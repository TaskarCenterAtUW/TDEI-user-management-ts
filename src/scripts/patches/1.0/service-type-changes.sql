ALTER TABLE IF EXISTS public.service
    ADD COLUMN service_type character varying(20);
UPDATE service set service_type='flex';