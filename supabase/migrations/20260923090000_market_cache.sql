-- Market price cache: accumulated daily snapshots from data.gov.in
-- (Agmarknet), written only by the market-prices Edge Function via the
-- service role. Never exposed directly to the frontend.
create table public.market_cache (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district text,
  market text not null,
  commodity text not null,
  variety text not null default '',
  grade text,
  arrival_date date not null,
  min_price numeric,
  max_price numeric,
  modal_price numeric,
  fetched_at timestamptz not null default now(),
  unique (market, commodity, variety, arrival_date)
);

alter table public.market_cache enable row level security;
-- No policies: only the service role (used by the market-prices Edge
-- Function) can read or write this table.

create index market_cache_state_idx on public.market_cache (state);
create index market_cache_trend_idx on public.market_cache (commodity, market, variety, arrival_date);

-- Latest known price per market/commodity/variety, for listing & search.
-- security_invoker means it respects market_cache's RLS for any caller
-- other than the service role (which bypasses RLS regardless).
create view public.market_latest_prices
with (security_invoker = true) as
select distinct on (market, commodity, variety)
  id, state, district, market, commodity, variety, grade,
  arrival_date, min_price, max_price, modal_price, fetched_at
from public.market_cache
order by market, commodity, variety, arrival_date desc, fetched_at desc;
