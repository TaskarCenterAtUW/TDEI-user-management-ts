DELETE from public.role_permission where role_id IN (SELECT role_id FROM public.roles WHERE name = 'tdei_user');
DELETE FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE name = 'tdei_user');
DELETE FROM public.roles WHERE name = 'tdei_user';