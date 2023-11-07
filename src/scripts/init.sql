CREATE EXTENSION IF NOT EXISTS postgis;
    
    -- Table: public.project_group

    -- DROP TABLE IF EXISTS public.project_group;

    CREATE TABLE IF NOT EXISTS public.project_group
    (
        project_group_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        phone character varying(20) COLLATE pg_catalog."default" NOT NULL,
        url character varying(500) COLLATE pg_catalog."default",
        address character varying(500) COLLATE pg_catalog."default" NOT NULL,
		polygon geometry(Polygon,4326),
        is_active boolean NOT NULL DEFAULT true,
        CONSTRAINT project_group_pkey PRIMARY KEY (project_group_id),
        CONSTRAINT unq_project_group UNIQUE (name)
    )


    TABLESPACE pg_default;


    -- Table: public.permission

    -- DROP TABLE IF EXISTS public.permission;

    CREATE TABLE IF NOT EXISTS public.permission
    (
        permission_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 301 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description character varying(500) COLLATE pg_catalog."default",
        CONSTRAINT perm_pkey PRIMARY KEY (permission_id),
        CONSTRAINT unq_perm UNIQUE (name)
    )

    TABLESPACE pg_default;


        -- Table: public.roles

    -- DROP TABLE IF EXISTS public.roles;

    CREATE TABLE IF NOT EXISTS public.roles
    (
        role_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 201 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description character varying(500) COLLATE pg_catalog."default",
        CONSTRAINT roles_pkey PRIMARY KEY (role_id),
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
            REFERENCES public.permission (permission_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT fk_role_id FOREIGN KEY (role_id)
            REFERENCES public.roles (role_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    )

    TABLESPACE pg_default;
    

        -- Table: public.service

    -- DROP TABLE IF EXISTS public.service;

    CREATE TABLE IF NOT EXISTS public.service
    (
        service_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        polygon geometry(Polygon,4326),
        owner_project_group character varying(100) NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        CONSTRAINT service_pkey PRIMARY KEY (service_id),
        CONSTRAINT unq_service_project_group UNIQUE (name, owner_project_group),
        CONSTRAINT fk_project_group_id FOREIGN KEY (owner_project_group)
            REFERENCES public.project_group (project_group_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID
    )

    TABLESPACE pg_default;
    


        -- Table: public.station

    -- DROP TABLE IF EXISTS public.station;

CREATE TABLE IF NOT EXISTS public.station
(
    station_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
	polygon geometry(Polygon,4326),
    owner_project_group character varying(100) COLLATE pg_catalog."default" NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT station_pkey PRIMARY KEY (station_id),
    CONSTRAINT unq_station_project_group UNIQUE (name, owner_project_group),
    CONSTRAINT fk_project_group_id FOREIGN KEY (owner_project_group)
        REFERENCES public.project_group (project_group_id) MATCH SIMPLE
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

    TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS project_group_geom_idx
  ON project_group
  USING GIST (polygon);
CREATE INDEX IF NOT EXISTS service_geom_idx
    ON public.service USING gist
    (polygon);
CREATE INDEX IF NOT EXISTS station_geom_idx
    ON public.station USING gist
    (polygon);



    