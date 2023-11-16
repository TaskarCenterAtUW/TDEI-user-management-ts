
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