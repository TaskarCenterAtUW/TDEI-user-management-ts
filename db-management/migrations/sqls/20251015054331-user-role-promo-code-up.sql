ALTER TABLE IF EXISTS public.user_roles
    ADD COLUMN referral_code character varying(100);

ALTER TABLE IF EXISTS public.user_roles
    ADD COLUMN updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS public.promo_referrals
    ADD COLUMN redirect_url character varying(2048);