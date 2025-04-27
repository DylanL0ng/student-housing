-- General read access for public profiles
create policy "Allow public read access to profiles"
on public.profiles
to public
using (true);

-- Insert policy for users to add their own profile
create policy "Allow users to insert their own profile"
on public.profiles
to public
with check (
  auth.uid() = id
);

-- Update policy for users to update their own profile
create policy "Allow users to update their own profile"
on public.profiles
to public
using (
  auth.uid() = id
);