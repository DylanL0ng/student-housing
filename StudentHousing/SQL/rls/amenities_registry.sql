-- Read access for all users to amenities_registry
create policy "Allow public read access to amenities registry"
on public.amenities_registry
for select
to public
using (true);