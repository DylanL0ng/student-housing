-- Allow users to view other accounts
create policy "Allow users to view other accounts in profile mapping"
on "public"."profile_mapping"
for select
to public
using (
  true
);

-- Allow users to update their own account in profile mapping
create policy "Allow users to update their own profile mapping account"
on "public"."profile_mapping"
for update
to public
using (
  (auth.uid() = linked_profile)
);