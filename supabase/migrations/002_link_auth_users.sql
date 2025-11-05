-- Add auth_user_id to link Supabase Auth users to our users table
alter table users add column if not exists auth_user_id uuid unique;

-- Create index
create index if not exists idx_users_auth_user_id on users(auth_user_id);

-- Update RLS policies to use auth_user_id instead of id = auth.uid()

-- Drop old policies
drop policy if exists "Users can view their own organization" on organizations;
drop policy if exists "Users can view users in their organization" on users;
drop policy if exists "Users can update their own profile" on users;
drop policy if exists "Users can view tickets in their organization" on tickets;
drop policy if exists "Users can create tickets in their organization" on tickets;
drop policy if exists "Users can update tickets in their organization" on tickets;
drop policy if exists "Users can view comments on tickets in their org" on comments;
drop policy if exists "Users can create comments on tickets in their org" on comments;

-- Organizations policies
create policy "Users can view their own organization"
  on organizations for select
  using (
    id in (
      select org_id from users where auth_user_id = auth.uid()
    )
  );

-- Users policies
create policy "Users can view users in their organization"
  on users for select
  using (
    org_id in (
      select org_id from users where auth_user_id = auth.uid()
    )
  );

create policy "Users can update their own profile"
  on users for update
  using (auth_user_id = auth.uid());

-- Tickets policies
create policy "Users can view tickets in their organization"
  on tickets for select
  using (
    org_id in (
      select org_id from users where auth_user_id = auth.uid()
    )
  );

create policy "Users can create tickets in their organization"
  on tickets for insert
  with check (
    org_id in (
      select org_id from users where auth_user_id = auth.uid()
    )
  );

create policy "Users can update tickets in their organization"
  on tickets for update
  using (
    org_id in (
      select org_id from users where auth_user_id = auth.uid()
    )
  );

-- Comments policies (keep the relaxed ones we already have)
drop policy if exists "Anyone can view comments" on comments;
drop policy if exists "Authenticated users can create comments" on comments;

create policy "Users can view comments on tickets in their org"
  on comments for select
  using (
    ticket_id in (
      select id from tickets where org_id in (
        select org_id from users where auth_user_id = auth.uid()
      )
    )
  );

create policy "Users can create comments on tickets in their org"
  on comments for insert
  with check (
    ticket_id in (
      select id from tickets where org_id in (
        select org_id from users where auth_user_id = auth.uid()
      )
    )
  );

