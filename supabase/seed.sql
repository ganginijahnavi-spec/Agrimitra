-- Demo data for a test account only. No-ops if that account doesn't exist,
-- so this is safe to run on any project. All rows are clearly labelled.
do $$
declare
  demo_user_id uuid;
begin
  select id into demo_user_id from auth.users where email = 'demo@agrimitra.local' limit 1;

  if demo_user_id is not null then
    insert into public.crops (
      user_id, crop_name, variety, area_acres, soil_type,
      sowing_date, expected_harvest_date, irrigation_type, notes
    )
    values
      (
        demo_user_id, 'Paddy', 'BPT 5204', 2.5, 'Clay loam',
        '2026-06-15', '2026-10-15', 'Canal', 'Demo data — sample crop for testing.'
      ),
      (
        demo_user_id, 'Chilli', 'Teja', 1.2, 'Red sandy loam',
        '2026-07-01', '2026-12-01', 'Drip', 'Demo data — sample crop for testing.'
      );
  end if;
end $$;
