
    -- Table: public.organization

    -- DROP TABLE IF EXISTS public.organization;

    CREATE TABLE IF NOT EXISTS public.organization
    (
        id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        phone character varying(20) COLLATE pg_catalog."default" NOT NULL,
        url character varying(500) COLLATE pg_catalog."default",
        address character varying(500) COLLATE pg_catalog."default" NOT NULL,
        CONSTRAINT org_pkey PRIMARY KEY (id),
        CONSTRAINT unq_org UNIQUE (name)
    )


    TABLESPACE pg_default;


    -- Table: public.permission

    -- DROP TABLE IF EXISTS public.permission;

    CREATE TABLE IF NOT EXISTS public.permission
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 301 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description character varying(500) COLLATE pg_catalog."default",
        CONSTRAINT perm_pkey PRIMARY KEY (id),
        CONSTRAINT unq_perm UNIQUE (name)
    )

    TABLESPACE pg_default;


        -- Table: public.roles

    -- DROP TABLE IF EXISTS public.roles;

    CREATE TABLE IF NOT EXISTS public.roles
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 201 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description character varying(500) COLLATE pg_catalog."default",
        CONSTRAINT roles_pkey PRIMARY KEY (id),
        CONSTRAINT unq_roles UNIQUE (name)
    )

    TABLESPACE pg_default;
    


        -- Table: public.role_permission

    -- DROP TABLE IF EXISTS public.role_permission;

    CREATE TABLE IF NOT EXISTS public.role_permission
    (
        role_id integer,
        permission_id integer,
        CONSTRAINT fk_permission_id FOREIGN KEY (permission_id)
            REFERENCES public.permission (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT fk_role_id FOREIGN KEY (role_id)
            REFERENCES public.roles (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    )

    TABLESPACE pg_default;
    

        -- Table: public.service

    -- DROP TABLE IF EXISTS public.service;

    CREATE TABLE IF NOT EXISTS public.service
    (
        id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description character varying(500) COLLATE pg_catalog."default",
        org_id character varying(100) NOT NULL,
        CONSTRAINT service_pkey PRIMARY KEY (id),
        CONSTRAINT unq_service UNIQUE (name),
        CONSTRAINT fk_org_id FOREIGN KEY (org_id)
            REFERENCES public.organization (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID
    )

    TABLESPACE pg_default;
    


        -- Table: public.station

    -- DROP TABLE IF EXISTS public.station;

    CREATE TABLE IF NOT EXISTS public.station
(
    id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
    stop_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    stop_code character varying(100) COLLATE pg_catalog."default",
    org_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    stop_lat double precision NOT NULL,
    stop_lon double precision NOT NULL,
    CONSTRAINT station_pkey PRIMARY KEY (id),
    CONSTRAINT unq_station UNIQUE (stop_name),
    CONSTRAINT fk_org_id FOREIGN KEY (org_id)
        REFERENCES public.organization (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

    TABLESPACE pg_default;
    

        -- Table: public.user_roles

    -- DROP TABLE IF EXISTS public.user_roles;

    CREATE TABLE IF NOT EXISTS public.user_roles
    (
        user_id character varying(36) COLLATE pg_catalog."default" NOT NULL,
        role_id integer NOT NULL,
        org_id character varying(100) COLLATE pg_catalog."default",
        CONSTRAINT unq_user_role_org UNIQUE (user_id, role_id, org_id),
        CONSTRAINT fk_org_id FOREIGN KEY (org_id)
            REFERENCES public.organization (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT fk_role_id FOREIGN KEY (role_id)
            REFERENCES public.roles (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    )

    TABLESPACE pg_default;




    