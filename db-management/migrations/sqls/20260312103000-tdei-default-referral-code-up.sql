WITH default_pg AS (
    SELECT project_group_id
    FROM public.project_group
    WHERE name = 'TDEI Default'
    LIMIT 1
),
system_usr AS (
    SELECT id::uuid AS user_id
    FROM keycloak.user_entity
    WHERE email = 'admin@tdei.com'
    LIMIT 1
),
fallback_user AS (
    SELECT COALESCE((SELECT user_id FROM system_usr), gen_random_uuid()) AS user_id
)
INSERT INTO public.promo_referrals
    (name, type, valid_from, code, valid_to, instructions_url, project_group_id, user_id, description, is_active, redirect_url)
SELECT
    'TDEI System Default Referral',
    1,
    NOW(),
    'TD-R89-PILT-CA',
    NULL,
    NULL,
    default_pg.project_group_id,
    fallback_user.user_id,
    'Default referral code for TDEI default project group',
    true,
    NULL
FROM default_pg, fallback_user
WHERE NOT EXISTS (
    SELECT 1
    FROM public.promo_referrals
    WHERE UPPER(code) = UPPER('TD-R89-PILT-CA')
);
