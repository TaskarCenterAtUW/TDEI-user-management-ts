ALTER TABLE IF EXISTS public.user_roles
    ADD COLUMN IF NOT EXISTS   referral_code character varying(100);

ALTER TABLE IF EXISTS public.user_roles
    ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS public.promo_referrals
    ADD COLUMN IF NOT EXISTS redirect_url character varying(2048);