-- General read access for all users to interest_registry
create policy "Allow public read access to interest registry"
on public.interest_registry
to public
using (true);