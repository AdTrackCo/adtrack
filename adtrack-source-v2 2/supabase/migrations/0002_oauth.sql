-- OAuth handshake state, used to tie a platform redirect back to the user
-- who started it and to block CSRF. Rows are consumed by the callback and
-- expire after 10 minutes.

create table if not exists public.oauth_states (
  nonce uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;

-- Users may only create state rows for themselves. The callback reads these
-- with the service role key, which bypasses RLS by design.
create policy "Users create their own oauth state"
  on public.oauth_states for insert
  with check (auth.uid() = user_id);

create policy "Users read their own oauth state"
  on public.oauth_states for select
  using (auth.uid() = user_id);

-- Housekeeping: drop stale handshake rows.
create index if not exists oauth_states_created_at_idx on public.oauth_states (created_at);
