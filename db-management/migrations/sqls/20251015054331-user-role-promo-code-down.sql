ALTER TABLE IF EXISTS public.user_roles
    DROP COLUMN IF EXISTS referral_code;

ALTER TABLE IF EXISTS public.user_roles
    DROP COLUMN IF EXISTS updated_at;
