-- Create extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('admin', 'agent', 'user');
create type ticket_status as enum ('open', 'in_progress', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high');
create type subscription_plan as enum ('free', 'pro', 'enterprise');

-- Organizations table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slack_team_id text unique,
  stripe_customer_id text unique,
  plan subscription_plan default 'free',
  created_at timestamptz default now()
);

-- Users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  email text unique not null,
  name text,
  slack_user_id text,
  role user_role default 'user',
  avatar_url text,
  created_at timestamptz default now()
);

-- Tickets table
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  ticket_number serial unique not null,
  title text not null,
  description text,
  status ticket_status default 'open',
  priority ticket_priority default 'medium',
  requester_id uuid references users(id) on delete set null,
  assignee_id uuid references users(id) on delete set null,
  tags text[] default '{}',
  slack_channel_id text,
  slack_thread_ts text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

-- Comments table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id) on delete cascade not null,
  user_id uuid references users(id) on delete set null,
  content text not null,
  is_internal boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index idx_users_org_id on users(org_id);
create index idx_users_email on users(email);
create index idx_users_slack_user_id on users(slack_user_id);
create index idx_tickets_org_id on tickets(org_id);
create index idx_tickets_status on tickets(status);
create index idx_tickets_assignee_id on tickets(assignee_id);
create index idx_tickets_requester_id on tickets(requester_id);
create index idx_tickets_created_at on tickets(created_at desc);
create index idx_comments_ticket_id on comments(ticket_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger to tickets table
create trigger update_tickets_updated_at
  before update on tickets
  for each row
  execute function update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table organizations enable row level security;
alter table users enable row level security;
alter table tickets enable row level security;
alter table comments enable row level security;

-- Organizations policies
create policy "Users can view their own organization"
  on organizations for select
  using (
    id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Users policies
create policy "Users can view users in their organization"
  on users for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

create policy "Users can update their own profile"
  on users for update
  using (id = auth.uid());

-- Tickets policies
create policy "Users can view tickets in their organization"
  on tickets for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

create policy "Users can create tickets in their organization"
  on tickets for insert
  with check (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

create policy "Users can update tickets in their organization"
  on tickets for update
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Comments policies
create policy "Users can view comments on tickets in their org"
  on comments for select
  using (
    ticket_id in (
      select id from tickets where org_id in (
        select org_id from users where id = auth.uid()
      )
    )
  );

create policy "Users can create comments on tickets in their org"
  on comments for insert
  with check (
    ticket_id in (
      select id from tickets where org_id in (
        select org_id from users where id = auth.uid()
      )
    )
  );

-- Function to automatically set closed_at when status changes to closed
create or replace function set_closed_at()
returns trigger as $$
begin
  if new.status = 'closed' and old.status != 'closed' then
    new.closed_at = now();
  elsif new.status != 'closed' then
    new.closed_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger ticket_closed_at_trigger
  before update on tickets
  for each row
  execute function set_closed_at();

