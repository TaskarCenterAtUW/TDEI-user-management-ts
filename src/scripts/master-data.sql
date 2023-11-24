--Trucates any existing permission
TRUNCATE TABLE permission RESTART IDENTITY CASCADE;
--Inserts new permission to the system
INSERT INTO public.permission(name, description) VALUES ( 'user_manage', 'User management permission who can add, edit, list, delete, manage permissions of the user. [Super admin permission]');
INSERT INTO public.permission(name, description) VALUES ( 'add_poc', 'Can add poc for the project group');
INSERT INTO public.permission(name, description) VALUES ( 'add_project_group_users', 'Can assign users to project group');
INSERT INTO public.permission(name, description) VALUES ( 'gtfs_flex_upload', 'Can upload for gtfs flex service');
INSERT INTO public.permission(name, description) VALUES ( 'gtfs_pathways_upload', 'Can upload for gtfs pathways service');
INSERT INTO public.permission(name, description) VALUES ( 'osw_upload', 'Can upload for osw service');
INSERT INTO public.permission(name, description) VALUES ( 'register_flex_services', 'Can register for gtfs flex services');
INSERT INTO public.permission(name, description) VALUES ( 'register_pathways_station', 'Can register for gtfs pathways stations');
--Trucates any existing permission
TRUNCATE TABLE roles RESTART IDENTITY CASCADE;
INSERT INTO public.roles(name, description)	VALUES ('flex_data_generator', 'Flex Data generator can publish file for the project group');
INSERT INTO public.roles(name, description)	VALUES ('tdei_admin', 'TDEI super admin');
INSERT INTO public.roles(name, description)	VALUES ('poc', 'Point of contact of project group');
INSERT INTO public.roles(name, description)	VALUES ('tdei_user', 'User of the TDEI system');
INSERT INTO public.roles(name, description)	VALUES ('pathways_data_generator', 'Pathways Data generator can publish file for the project group');
INSERT INTO public.roles(name, description)	VALUES ('osw_data_generator', 'OSW Data generator can publish file for the project group');

-- POC -> tdei_user, poc, data_generator
--flex-data_generator
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (201, 304);
--pathways-data_generator
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (205, 305);
--osw-data_generator
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (206, 306);
--poc
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 303);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 304);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 305);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 306);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 307);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (203, 308);
--tdei_user
-- INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (204, 307);
--tdei_admin
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (202, 301);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (202, 302);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (202, 307);
INSERT INTO public.role_permission(	role_id, permission_id)	VALUES (202, 308);

-- Add admin roles 
INSERT INTO public.user_roles
SELECT id, 202, null 
FROM keycloak.user_entity 
WHERE email = 'admin@tdei.com'
LIMIT 1; 
