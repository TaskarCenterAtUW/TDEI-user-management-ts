CREATE OR REPLACE FUNCTION tdei_fetch_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Using CTEs to aggregate metrics from multiple tables
    WITH
        users_cte AS (
            SELECT count(Distinct(user_id)) as totalUsers FROM public.user_roles ur
            INNER JOIN public.roles r ON ur.role_id = r.role_id
            WHERE r.name != 'tdei_admin'
        ),
        project_groups_cte AS (
            SELECT COUNT(*) as totalProjectGroups FROM public.project_group WHERE is_active = 'true'
        ),
        services_cte AS (
            SELECT 
            COUNT(*) AS totalServices,
            SUM(CASE WHEN service_type = 'osw' THEN 1 ELSE 0 END) AS osw_count,
            SUM(CASE WHEN service_type = 'flex' THEN 1 ELSE 0 END) AS flex_count,
            SUM(CASE WHEN service_type = 'pathways' THEN 1 ELSE 0 END) AS pathways_count
            FROM public.service WHERE is_active = 'true'
        )
    -- Build the JSON result
    SELECT json_build_object(
        'systemMetrics', json_build_object(
            'totalUsers', uc.totalUsers,
            'totalServices', sc.totalServices,
            'totalProjectGroups', pgc.totalProjectGroups,
            'servicesByType', json_build_object(
                'osw', sc.osw_count,
                'flex', sc.flex_count,
                'pathways', sc.pathways_count
            )
        )
    ) INTO result
    FROM users_cte uc
    CROSS JOIN project_groups_cte pgc
    CROSS JOIN services_cte sc;

    -- Return the result as a JSON array
    RETURN result;
END;
$$ LANGUAGE plpgsql;

