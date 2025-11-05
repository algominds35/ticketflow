-- Drop the problematic policies
drop policy if exists "Users can view users in their organization" on users;
drop policy if exists "Users can update their own profile" on users;
drop policy if exists "Users can view their own organization" on organizations;

-- Create simpler policies that don't cause recursion

-- Users can view all users (simplified for now)
create policy "Users can view all users"
  on users for select
  using (true);

-- Users can insert their own user record
create policy "Users can insert their own record"
  on users for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Organizations: users can view all organizations (simplified)
create policy "Users can view organizations"
  on organizations for select
  using (true);

-- Organizations: users can insert organizations
create policy "Users can create organizations"
  on organizations for insert
  with check (true);

