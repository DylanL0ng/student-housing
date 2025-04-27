-- General read access for all users to profile_information_registry
create policy "Allow public read access to profile information registry"
on public.profile_information_registry
to public
using (true);
