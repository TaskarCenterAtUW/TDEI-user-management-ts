-- One roles catalog. client_id is the Keycloak client (the application).
-- Roles that already exist belong to the TDEI gateway client.
ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS client_id character varying(255) NOT NULL DEFAULT 'tdei-gateway';

ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS unq_roles;

ALTER TABLE public.roles
    ADD CONSTRAINT unq_roles UNIQUE (client_id, name);

CREATE TABLE IF NOT EXISTS public.user_application_role
(
    user_id character varying(36) NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT pk_user_application_role PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_application_role_role FOREIGN KEY (role_id)
        REFERENCES public.roles (role_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

INSERT INTO public.roles (name, description, client_id)
VALUES ('chatbot_manager', 'Responsible for managing the chatbot', 'tdei-chat')
ON CONFLICT ON CONSTRAINT unq_roles DO NOTHING;
