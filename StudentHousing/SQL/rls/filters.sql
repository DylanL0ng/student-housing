-- General read access for all users to filters
create policy "Allow public read access to filters"
on public.filters
to public
using (true);