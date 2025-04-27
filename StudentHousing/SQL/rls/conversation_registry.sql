-- General read access for all users to conversation_registry
create policy "Allow public read access to conversation registry"
on public.conversation_registry
to public
using (true);