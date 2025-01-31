-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  is_computer boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create trigger function for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_computer)
  values (new.id, new.email, new.email = 'computer@yugioh-card-maker.com')
  on conflict (id) do update
  set email = excluded.email,
      is_computer = excluded.is_computer;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Create computer player and sync profiles
do $$
declare
  computer_user_id uuid;
begin
  -- Check if computer player exists
  select id into computer_user_id
  from auth.users
  where email = 'computer@yugioh-card-maker.com'
  limit 1;

  -- Create computer player if it doesn't exist
  if computer_user_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    )
    select
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'computer@yugioh-card-maker.com',
      crypt('computer-password', gen_salt('bf')),
      now(),
      now(),
      now()
    where not exists (
      select 1 from auth.users where email = 'computer@yugioh-card-maker.com'
    )
    returning id into computer_user_id;
  end if;

  -- Sync all users to profiles
  insert into public.profiles (id, email, is_computer)
  select 
    id,
    email,
    email = 'computer@yugioh-card-maker.com'
  from auth.users
  on conflict (id) do update
  set email = excluded.email,
      is_computer = excluded.is_computer;

  -- Give computer player initial cards if needed
  if computer_user_id is not null then
    insert into saved_cards (user_id, name, type, attribute, level, atk, def, description)
    select 
      computer_user_id,
      'Computer Dragon',
      'Monster',
      'LIGHT',
      8,
      3000,
      2500,
      'A powerful dragon controlled by artificial intelligence.'
    where not exists (
      select 1 from saved_cards where user_id = computer_user_id
    );
  end if;

exception when others then
  raise notice 'Error creating computer player: %', sqlerrm;
  raise;
end $$;
