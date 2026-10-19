DELETE FROM public.user_application_role
WHERE role_id IN (
    SELECT role_id FROM public.roles
    WHERE client_id = 'tdei-chat' AND name = 'chatbot_manager'
);

DELETE FROM public.roles
WHERE client_id = 'tdei-chat' AND name = 'chatbot_manager';

DROP TABLE IF EXISTS public.user_application_role;

ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS unq_roles;

ALTER TABLE public.roles
    ADD CONSTRAINT unq_roles UNIQUE (name);

ALTER TABLE public.roles DROP COLUMN IF EXISTS client_id;
