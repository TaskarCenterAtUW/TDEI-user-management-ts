ALTER TABLE public.service
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN service_id TYPE VARCHAR(36),
    ALTER COLUMN owner_project_group TYPE VARCHAR(36);
	
ALTER TABLE public.project_group
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN project_group_id TYPE VARCHAR(36),
    ALTER COLUMN phone TYPE VARCHAR(15),
    ALTER COLUMN address TYPE VARCHAR(255),
    ALTER COLUMN url TYPE VARCHAR(255);

ALTER TABLE public.user_roles
    ALTER COLUMN project_group_id TYPE VARCHAR(36);

ALTER TABLE station RENAME TO station_obsolete;

ALTER TABLE public.permission
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN description TYPE VARCHAR(255);

ALTER TABLE public.roles
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN description TYPE VARCHAR(255);
