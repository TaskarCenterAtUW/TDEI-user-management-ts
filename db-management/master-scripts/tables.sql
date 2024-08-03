CREATE TABLE IF NOT EXISTS public.permission
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 301 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default",
    CONSTRAINT perm_pkey PRIMARY KEY (id),
    CONSTRAINT unq_perm UNIQUE (name)
)


CREATE TABLE IF NOT EXISTS public.project_group
(
    project_group_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(20) COLLATE pg_catalog."default",
    url character varying(500) COLLATE pg_catalog."default",
    address character varying(500) COLLATE pg_catalog."default" NOT NULL,
    polygon geography,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT project_group_pkey PRIMARY KEY (project_group_id),
    CONSTRAINT unq_project_group UNIQUE (name)
)

CREATE TABLE IF NOT EXISTS public.roles
(
    role_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 201 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default",
    CONSTRAINT roles_pkey PRIMARY KEY (role_id),
    CONSTRAINT unq_roles UNIQUE (name)
)


CREATE TABLE IF NOT EXISTS public.service
(
    service_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    owner_project_group character varying(100) COLLATE pg_catalog."default" NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    polygon geometry,
    service_type character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT service_pkey PRIMARY KEY (service_id),
    CONSTRAINT unq_service_project_group UNIQUE (name, owner_project_group),
    CONSTRAINT fk_project_group_id FOREIGN KEY (owner_project_group)
        REFERENCES public.project_group (project_group_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.user_roles
(
    user_id character varying(36) COLLATE pg_catalog."default" NOT NULL,
    role_id integer NOT NULL,
    project_group_id character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT unq_user_role_project_group UNIQUE (user_id, role_id, project_group_id),
    CONSTRAINT fk_project_group_id FOREIGN KEY (project_group_id)
        REFERENCES public.project_group (project_group_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_role_id FOREIGN KEY (role_id)
        REFERENCES public.roles (role_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.role_permission
(
    role_id integer,
    permission_id integer,
    CONSTRAINT fk_permission_id FOREIGN KEY (permission_id)
        REFERENCES public.permission (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_role_id FOREIGN KEY (role_id)
        REFERENCES public.roles (role_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)