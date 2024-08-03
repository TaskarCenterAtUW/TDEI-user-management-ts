CREATE INDEX IF NOT EXISTS project_group_geom_idx
    ON public.project_group USING gist
    (polygon)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS service_geom_idx
    ON public.service USING gist
    (polygon)
    TABLESPACE pg_default;