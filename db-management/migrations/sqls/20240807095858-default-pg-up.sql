INSERT INTO public.project_group ( name, address) VALUES ('TDEI Default', 'USA');

INSERT INTO public.roles(name, description)	
VALUES ('member', 'TDEI member');

-- Adding default role to all users 
WITH default_role AS (
    SELECT role_id FROM public.roles WHERE name = 'member'
),
default_pg AS (
    SELECT project_group_id FROM public.project_group WHERE name = 'TDEI Default'
)
INSERT INTO public.user_roles(user_id, role_id, project_group_id) 
SELECT id, role_id, project_group_id
FROM keycloak.user_entity, default_role, default_pg;