// src/supabase.js
// ─────────────────────────────────────────────────────────────
// Remplace VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
// par tes vraies valeurs depuis supabase.com > Project Settings > API
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Variables Supabase manquantes dans .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ─────────────────────────────────────────────────────────────
// SCHEMA SQL — colle tout ça dans Supabase > SQL Editor > New Query
// ─────────────────────────────────────────────────────────────
/*

-- 1. PROFILES (infos utilisateurs)
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  pseudo      text unique not null,
  email       text,
  sexe        text,
  age         int,
  poids       numeric,
  taille      numeric,
  bio         text default '',
  avatar_url  text default '',
  pinned_trophies text[] default '{}',
  trophy_dates jsonb default '{}',
  country     text default 'France',
  points      int default 0,
  sessions    int default 0,
  prs         int default 0,
  streak      int default 0,
  total_likes int default 0,
  followers_count int default 0,
  following_count int default 0,
  posts_count int default 0,
  early_session boolean default false,
  night_session boolean default false,
  weekend_sessions int default 0,
  comments_sent int default 0,
  last_session_date text default '',
  created_at  timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
create policy "Profiles visibles par tous" on profiles for select using (true);
create policy "Modifier son propre profil" on profiles for update using (auth.uid() = id);
create policy "Insérer son profil" on profiles for insert with check (auth.uid() = id);

-- 2. POSTS
create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  pseudo      text,
  caption     text default '',
  tags        text[] default '{}',
  media_url   text default '',
  is_video    boolean default false,
  rank_name   text default 'Silver I',
  rank_color  text default '#94A3B8',
  rank_icon   text default '🥈',
  points      int default 0,
  likes_count int default 0,
  comments_count int default 0,
  created_at  timestamptz default now()
);

alter table posts enable row level security;
create policy "Posts visibles par tous" on posts for select using (true);
create policy "Créer son post" on posts for insert with check (auth.uid() = user_id);
create policy "Supprimer son post" on posts for delete using (auth.uid() = user_id);

-- 3. LIKES
create table likes (
  id      uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique(post_id, user_id)
);

alter table likes enable row level security;
create policy "Likes visibles par tous" on likes for select using (true);
create policy "Liker" on likes for insert with check (auth.uid() = user_id);
create policy "Unliker" on likes for delete using (auth.uid() = user_id);

-- 4. COMMENTS
create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  pseudo     text,
  text       text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;
create policy "Commentaires visibles" on comments for select using (true);
create policy "Commenter" on comments for insert with check (auth.uid() = user_id);

-- 5. FOLLOWS
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  primary key(follower_id, following_id)
);

alter table follows enable row level security;
create policy "Follows visibles" on follows for select using (true);
create policy "Suivre" on follows for insert with check (auth.uid() = follower_id);
create policy "Ne plus suivre" on follows for delete using (auth.uid() = follower_id);

-- 6. MESSAGES (conversations 1-to-1)
create table messages (
  id           uuid primary key default gen_random_uuid(),
  from_id      uuid references profiles(id) on delete cascade,
  to_id        uuid references profiles(id) on delete cascade,
  text         text not null,
  created_at   timestamptz default now()
);

alter table messages enable row level security;
create policy "Voir ses messages" on messages for select using (auth.uid() = from_id or auth.uid() = to_id);
create policy "Envoyer un message" on messages for insert with check (auth.uid() = from_id);

-- 7. NOTIFICATIONS
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  from_id    uuid references profiles(id) on delete cascade,
  type       text, -- 'like', 'comment', 'follow'
  post_id    uuid references posts(id) on delete cascade,
  read       boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Voir ses notifs" on notifications for select using (auth.uid() = user_id);
create policy "Créer notif" on notifications for insert with check (true);
create policy "Marquer lu" on notifications for update using (auth.uid() = user_id);

-- 8. SESSION HISTORY
create table session_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  day_name     text,
  program_name text,
  duration_sec int default 0,
  exercises    jsonb default '[]',
  created_at   timestamptz default now()
);

alter table session_history enable row level security;
create policy "Voir ses séances" on session_history for select using (auth.uid() = user_id);
create policy "Enregistrer séance" on session_history for insert with check (auth.uid() = user_id);

-- 9. EXERCISES (progression)
create table exercise_records (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  name       text,
  sets       jsonb,
  recorded_at timestamptz default now()
);

alter table exercise_records enable row level security;
create policy "Voir ses records" on exercise_records for select using (auth.uid() = user_id);
create policy "Enregistrer record" on exercise_records for insert with check (auth.uid() = user_id);

-- 10. PROGRAMS
create table programs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  name       text,
  days       jsonb default '[]',
  created_at timestamptz default now()
);

alter table programs enable row level security;
create policy "Voir ses programmes" on programs for select using (auth.uid() = user_id);
create policy "Créer programme" on programs for insert with check (auth.uid() = user_id);
create policy "Modifier programme" on programs for update using (auth.uid() = user_id);
create policy "Supprimer programme" on programs for delete using (auth.uid() = user_id);

-- Fonction auto-create profile après signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket pour les médias
insert into storage.buckets (id, name, public)
values ('gymbro-media', 'gymbro-media', true);

create policy "Upload média" on storage.objects
  for insert with check (bucket_id = 'gymbro-media' and auth.role() = 'authenticated');

create policy "Voir médias" on storage.objects
  for select using (bucket_id = 'gymbro-media');

*/
