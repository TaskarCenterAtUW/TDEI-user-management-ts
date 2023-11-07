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

--Insert three test project
with flexProjectGroup as (
  INSERT INTO public.project_group(name, phone, url, address) VALUES ('Seattle2', '12345', 'www.seattle.com', 'seattle, usa') RETURNING project_group.id
)
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT 'a5014caa-c597-4290-b462-8c41edea870c', 203, id
FROM flexProjectGroup;

with pathwayProjectGroup as (
  INSERT INTO public.project_group(name, phone, url, address) VALUES ('Washington', '12345', 'www.washington.com', 'washington, usa') RETURNING project_group.id
)
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT '0edff839-2753-44e6-88fb-3674430b05be', 203, id
FROM pathwayProjectGroup;

with oswProjectGroup as (
  INSERT INTO public.project_group(name, phone, url, address) VALUES ('Texas', '12345', 'www.texas.com', 'texas, usa') RETURNING project_group.id
)
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT '4c8bad08-593e-428b-aa3f-fe26ecb45141', 203, id
FROM oswProjectGroup;

INSERT INTO public.user_roles(user_id, role_id, project_group_id)	VALUES ('c59d29b6-a063-4249-943f-d320d15ac9ab', 202, null);
INSERT INTO public.user_roles(user_id, role_id, project_group_id)	VALUES ('c59d29b6-a063-4249-943f-d320d15ac9ab', 204, null);

--assign tdei-user role - OSW
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT user_id, 204, project_group_id
FROM user_roles WHERE user_id = '4c8bad08-593e-428b-aa3f-fe26ecb45141';

--assign tdei-user role - Flex
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT user_id, 204, project_group_id
FROM user_roles WHERE user_id = 'a5014caa-c597-4290-b462-8c41edea870c';

--assign tdei-user role - Pathways
INSERT INTO public.user_roles (user_id, role_id, project_group_id)	
SELECT user_id, 204, project_group_id
FROM user_roles WHERE user_id = '0edff839-2753-44e6-88fb-3674430b05be';

--User-Roles , Please update the USER-ID before running
--Admin Role
--INSERT INTO public.user_roles(user_id, role_id, project_group_id)	VALUES ('6a2f96cc-1809-45aa-8d11-84d0a89e0c11', 202, null);
-- osw@sdot.com, 4c8bad08-593e-428b-aa3f-fe26ecb45141, poc , ProjectGroup1
-- flex@gtfs.com, a5014caa-c597-4290-b462-8c41edea870c, poc , ProjectGroup2
-- pathways@gtfs.com, 0edff839-2753-44e6-88fb-3674430b05be, poc , ProjectGroup3
-- admin@tdei.com, c59d29b6-a063-4249-943f-d320d15ac9ab , tdei-admin, null
--Insert test users, assuming this users are created on keycloak