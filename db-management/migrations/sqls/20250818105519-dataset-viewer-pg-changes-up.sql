ALTER TABLE public.project_group
ADD IF NOT EXISTS COLUMN data_viewer_config JSON DEFAULT '{}'::JSON;    