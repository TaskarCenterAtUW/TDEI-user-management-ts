CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS public.permission
(
    permission_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 301 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default",
    CONSTRAINT perm_pkey PRIMARY KEY (id),
    CONSTRAINT unq_perm UNIQUE (name)
);

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
);

CREATE INDEX IF NOT EXISTS project_group_geom_idx
    ON public.project_group USING gist
    (polygon)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.roles
(
    role_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 201 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default",
    CONSTRAINT roles_pkey PRIMARY KEY (role_id),
    CONSTRAINT unq_roles UNIQUE (name)
);


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
);

CREATE INDEX IF NOT EXISTS service_geom_idx
    ON public.service USING gist
    (polygon)
    TABLESPACE pg_default;

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
);

CREATE TABLE IF NOT EXISTS public.role_permission
(
    role_id integer,
    permission_id integer,
    CONSTRAINT fk_permission_id FOREIGN KEY (permission_id)
        REFERENCES public.permission (permission_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_role_id FOREIGN KEY (role_id)
        REFERENCES public.roles (role_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Master data

-- Insert permissions

INSERT INTO public.permission(name, description) 
VALUES 
('user_manage', 'User management permission who can add, edit, list, delete, manage permissions of the user. [Super admin permission]'),
('add_poc', 'Can add poc for the project group'),
('add_project_group_users', 'Can assign users to project group'),
('gtfs_flex_upload', 'Can upload for gtfs flex service'),
('gtfs_pathways_upload', 'Can upload for gtfs pathways service'),
('osw_upload', 'Can upload for osw service'),
('register_services', 'Can register services');

-- Insert roles
INSERT INTO public.roles(name, description)	
VALUES 
('flex_data_generator', 'Flex Data generator can publish dataset for the project group'),
('tdei_admin', 'TDEI super admin'),
('poc', 'Point of contact of project group'),
('tdei_user', 'User of the TDEI system'),
('pathways_data_generator', 'Pathways Data generator can publish dataset for the project group'),
('osw_data_generator', 'OSW Data generator can publish dataset for the project group');


INSERT INTO public.role_permission(role_id, permission_id)
SELECT r.role_id, p.id
FROM public.roles r
CROSS JOIN public.permission p
WHERE (r.name, p.name) IN (
    ('flex_data_generator', 'gtfs_flex_upload'),
    ('pathways_data_generator', 'gtfs_pathways_upload'),
    ('osw_data_generator', 'osw_upload'),
    ('poc', 'add_project_group_users'),
    ('poc', 'gtfs_flex_upload'),
    ('poc', 'gtfs_pathways_upload'),
    ('poc', 'osw_upload'),
    ('poc', 'register_services'),
    ('tdei_admin', 'user_manage'),
    ('tdei_admin', 'add_poc'),
    ('tdei_admin', 'register_services')
);

-- Add admin roles 
INSERT INTO public.user_roles
SELECT id, 202, null 
FROM keycloak.user_entity 
WHERE email = 'admin@tdei.com'
LIMIT 1; 