-- Crops: a farmer's own crop records.
create table public.crops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  crop_name text not null,
  variety text,
  area_acres numeric check (area_acres is null or area_acres > 0),
  soil_type text,
  sowing_date date,
  expected_harvest_date date,
  irrigation_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint harvest_after_sowing check (
    sowing_date is null or expected_harvest_date is null or expected_harvest_date > sowing_date
  )
);

alter table public.crops enable row level security;

create policy "Users can manage their own crops"
  on public.crops for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index crops_user_id_idx on public.crops (user_id);

create trigger set_crops_updated_at
  before update on public.crops
  for each row execute function public.set_updated_at();

-- Chats: one AI chatbot conversation per row.
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  language text not null default 'en' check (language in ('en', 'te')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chats enable row level security;

create policy "Users can manage their own chats"
  on public.chats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index chats_user_id_idx on public.chats (user_id);

create trigger set_chats_updated_at
  before update on public.chats
  for each row execute function public.set_updated_at();

-- Chat messages: individual turns within a chat.
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can manage their own chat messages"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index chat_messages_chat_id_idx on public.chat_messages (chat_id);
create index chat_messages_user_id_idx on public.chat_messages (user_id);

-- Image analyses: crop photo advisory results.
create table public.image_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  crop_id uuid references public.crops (id) on delete set null,
  image_path text not null,
  result jsonb,
  confidence text check (confidence is null or confidence in ('low', 'medium', 'high')),
  language text not null default 'en' check (language in ('en', 'te')),
  created_at timestamptz not null default now()
);

alter table public.image_analyses enable row level security;

create policy "Users can manage their own image analyses"
  on public.image_analyses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index image_analyses_user_id_idx on public.image_analyses (user_id);
create index image_analyses_crop_id_idx on public.image_analyses (crop_id);

-- Usage limits: simple per-user daily rate limiting, written by Edge
-- Functions with the service role (which bypasses RLS).
create table public.usage_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, feature, day)
);

alter table public.usage_limits enable row level security;

create policy "Users can view their own usage"
  on public.usage_limits for select
  using (auth.uid() = user_id);

create index usage_limits_user_id_idx on public.usage_limits (user_id);

-- Storage: private bucket for crop photos, one folder per user.
insert into storage.buckets (id, name, public)
values ('crop-images', 'crop-images', false)
on conflict (id) do nothing;

create policy "Users can read their own crop images"
  on storage.objects for select
  using (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own crop images"
  on storage.objects for insert
  with check (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own crop images"
  on storage.objects for update
  using (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own crop images"
  on storage.objects for delete
  using (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);
