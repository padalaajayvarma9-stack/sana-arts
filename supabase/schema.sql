-- ==============================================================================
-- SANA ARTS: PROFILES SCHEMA & ROW LEVEL SECURITY SETUP
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create the public.profiles table linked to auth.users using UUID
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  account_type text default 'lover',
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Row Level Security Policies
-- Policy: Users can view their own profile record
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" 
  on public.profiles 
  for select 
  using (auth.uid() = id);

-- Policy: Users can insert their own profile record
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" 
  on public.profiles 
  for insert 
  with check (auth.uid() = id);

-- Policy: Users can update their own profile record
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" 
  on public.profiles 
  for update 
  using (auth.uid() = id);

-- 4. Automatically create or update profile upon auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, account_type, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'account_type', 'lover'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    account_type = coalesce(excluded.account_type, profiles.account_type),
    updated_at = now();
  return new;
end;
$$;

-- Trigger to call handle_new_user when an auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill existing users into public.profiles (if any already exist in auth.users)
insert into public.profiles (id, full_name, email, account_type, avatar_url)
select 
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  email,
  coalesce(raw_user_meta_data->>'account_type', 'lover'),
  coalesce(raw_user_meta_data->>'avatar_url', null)
from auth.users
on conflict (id) do nothing;
