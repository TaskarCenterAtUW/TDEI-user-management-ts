ALTER TABLE public.project_group
ADD COLUMN IF NOT EXISTS  data_viewer_config JSON DEFAULT '{}'::JSON;    