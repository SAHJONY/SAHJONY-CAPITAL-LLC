-- Sahjony CRM (Supabase Postgres) — Full Schema
-- Requires: extensions: uuid-ossp

create extension if not exists "uuid-ossp";

-- USERS / ROLES
create table if not exists crm_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  role text default 'agent', -- admin | agent | viewer
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CORE ENTITIES
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website text,
  industry text,
  size text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete set null,
  full_name text not null,
  title text,
  email text unique,
  phone text,
  source text,
  status text default 'prospect',
  lead_score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pipelines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists pipeline_stages (
  id uuid primary key default uuid_generate_v4(),
  pipeline_id uuid references pipelines(id) on delete cascade,
  name text not null,
  stage_order int default 0,
  probability int default 0,
  created_at timestamptz default now()
);

create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  pipeline_id uuid references pipelines(id) on delete set null,
  stage_id uuid references pipeline_stages(id) on delete set null,
  title text not null,
  amount numeric(12,2) default 0,
  status text default 'open',
  probability int default 0,
  close_date date,
  next_action_date date,
  owner_id uuid references crm_users(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references crm_users(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  title text not null,
  due_date date,
  status text default 'open',
  priority text default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  activity_type text,
  summary text,
  performed_at timestamptz default now(),
  created_by uuid references crm_users(id) on delete set null
);

create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  content text not null,
  created_by uuid references crm_users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);

create table if not exists contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

create table if not exists deal_tags (
  deal_id uuid references deals(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (deal_id, tag_id)
);

-- SIMPLE METRICS VIEW
create or replace view dashboard_metrics as
select
  (select count(*) from contacts) as total_contacts,
  (select count(*) from deals where status = 'open') as active_deals,
  (select coalesce(sum(amount),0) from deals where status = 'won') as won_revenue,
  (select count(*) from tasks where status = 'open') as open_tasks;

-- UPDATED_AT trigger helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_contacts before update on contacts
for each row execute function set_updated_at();

create trigger set_updated_at_companies before update on companies
for each row execute function set_updated_at();

create trigger set_updated_at_deals before update on deals
for each row execute function set_updated_at();

create trigger set_updated_at_tasks before update on tasks
for each row execute function set_updated_at();

create trigger set_updated_at_users before update on crm_users
for each row execute function set_updated_at();
