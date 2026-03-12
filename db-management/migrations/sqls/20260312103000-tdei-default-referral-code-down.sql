DELETE FROM public.promo_referrals pr
USING public.project_group pg
WHERE pr.project_group_id = pg.project_group_id
  AND pg.name = 'TDEI Default'
  AND UPPER(pr.code) = UPPER('TD-R89-PILT-CA');
