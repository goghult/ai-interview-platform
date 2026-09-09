create table if not exists public.interviews (
  id text primary key,
  role text not null,
  difficulty text not null,
  score integer not null,
  max_score integer not null,
  created_at timestamptz not null default now()
);

alter table public.interviews enable row level security;
