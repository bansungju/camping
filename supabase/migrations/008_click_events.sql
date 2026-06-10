-- 쿠팡 파트너스 클릭 추적 테이블
create table if not exists public.click_events (
  id          bigserial primary key,
  event_type  text not null default 'coupang_buy',
  slug        text not null,           -- 카테고리 슬러그 (backpacking-tent 등)
  brand       text,
  model       text,
  coupang_url text,
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,                    -- 비로그인 식별용 (localStorage UUID)
  created_at  timestamptz not null default now()
);

-- RLS: 익명 포함 insert 허용, select는 본인 것만
alter table public.click_events enable row level security;

create policy "anyone can insert click events"
  on public.click_events for insert
  with check (true);

create policy "users can read own clicks"
  on public.click_events for select
  using (user_id = auth.uid());

-- anon/authenticated 모두 insert 가능하도록
grant insert on public.click_events to anon, authenticated;
grant select on public.click_events to authenticated;
grant usage, select on sequence public.click_events_id_seq to anon, authenticated;
