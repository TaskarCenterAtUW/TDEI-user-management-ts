	ALTER TABLE public.service ALTER COLUMN polygon TYPE geometry USING polygon::geometry;
	ALTER TABLE public.project_group ALTER COLUMN polygon TYPE geometry USING polygon::geometry;