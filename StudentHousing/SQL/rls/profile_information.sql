-- General read access for all users to profile_information
create policy "Allow public read access to profile information"
on public.profile_information
to public
using (true);

-- Delete policy for users to delete their own profile information
create policy "Allow users to delete their own profile information"
on public.profile_information
to public
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_information.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- Insert policy for users to add their own profile information
create policy "Allow users to insert their own profile information"
on public.profile_information
to public
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_information.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- Update policy for users to update their own profile information
create policy "Allow users to update their own profile information"
on public.profile_information
to public
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_information.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);