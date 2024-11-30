create extension if not exists "postgis" with schema "public" version '3.3.2';

drop policy "Users can insert their own profile." on "public"."profiles";

drop policy "Users can update own profile." on "public"."profiles";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

drop index if exists "public"."profiles_pkey";

create table "public"."accommodation_tenants" (
    "accommodation_id" uuid not null default gen_random_uuid(),
    "tenant_id" uuid not null default gen_random_uuid()
);


alter table "public"."accommodation_tenants" enable row level security;

create table "public"."accommodations" (
    "accommodation_id" uuid not null default auth.uid(),
    "location" text not null,
    "price" double precision
);


alter table "public"."accommodations" enable row level security;

create table "public"."conversations" (
    "conversation_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid()
);


alter table "public"."conversations" enable row level security;

create table "public"."interests" (
    "interest_id" uuid not null default gen_random_uuid(),
    "label" character varying not null
);


alter table "public"."interests" enable row level security;

create table "public"."messages" (
    "message_id" uuid not null,
    "message" text not null,
    "conversation_id" uuid not null,
    "sent_at" timestamp with time zone not null
);


alter table "public"."messages" enable row level security;

create table "public"."user_interests" (
    "user_id" uuid not null default auth.uid(),
    "interest_id" uuid not null
);


alter table "public"."user_interests" enable row level security;

alter table "public"."profiles" drop column "id";

alter table "public"."profiles" drop column "website";

alter table "public"."profiles" add column "date_of_birth" timestamp with time zone default now();

alter table "public"."profiles" add column "location" geography(Point,4326);

alter table "public"."profiles" add column "user_id" uuid not null;

CREATE UNIQUE INDEX accommodation_tenants_pkey ON public.accommodation_tenants USING btree (accommodation_id, tenant_id);

CREATE UNIQUE INDEX accommodations_pkey ON public.accommodations USING btree (accommodation_id);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (conversation_id, user_id);

CREATE INDEX idx_user_location ON public.profiles USING gist (location);

CREATE UNIQUE INDEX interests_pkey ON public.interests USING btree (interest_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (message_id, conversation_id);

CREATE UNIQUE INDEX user_interests_pkey ON public.user_interests USING btree (user_id, interest_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (user_id);

alter table "public"."accommodation_tenants" add constraint "accommodation_tenants_pkey" PRIMARY KEY using index "accommodation_tenants_pkey";

alter table "public"."accommodations" add constraint "accommodations_pkey" PRIMARY KEY using index "accommodations_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."interests" add constraint "interests_pkey" PRIMARY KEY using index "interests_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."user_interests" add constraint "user_interests_pkey" PRIMARY KEY using index "user_interests_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."accommodation_tenants" add constraint "accommodation_tenants_accommodation_id_fkey" FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) not valid;

alter table "public"."accommodation_tenants" validate constraint "accommodation_tenants_accommodation_id_fkey";

alter table "public"."accommodation_tenants" add constraint "accommodation_tenants_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES profiles(user_id) not valid;

alter table "public"."accommodation_tenants" validate constraint "accommodation_tenants_tenant_id_fkey";

alter table "public"."conversations" add constraint "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) not valid;

alter table "public"."conversations" validate constraint "conversations_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."user_interests" add constraint "user_interests_interest_id_fkey" FOREIGN KEY (interest_id) REFERENCES interests(interest_id) not valid;

alter table "public"."user_interests" validate constraint "user_interests_interest_id_fkey";

alter table "public"."user_interests" add constraint "user_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) not valid;

alter table "public"."user_interests" validate constraint "user_interests_user_id_fkey";

create type "public"."geometry_dump" as ("path" integer[], "geom" geometry);

create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);

grant delete on table "public"."accommodation_tenants" to "anon";

grant insert on table "public"."accommodation_tenants" to "anon";

grant references on table "public"."accommodation_tenants" to "anon";

grant select on table "public"."accommodation_tenants" to "anon";

grant trigger on table "public"."accommodation_tenants" to "anon";

grant truncate on table "public"."accommodation_tenants" to "anon";

grant update on table "public"."accommodation_tenants" to "anon";

grant delete on table "public"."accommodation_tenants" to "authenticated";

grant insert on table "public"."accommodation_tenants" to "authenticated";

grant references on table "public"."accommodation_tenants" to "authenticated";

grant select on table "public"."accommodation_tenants" to "authenticated";

grant trigger on table "public"."accommodation_tenants" to "authenticated";

grant truncate on table "public"."accommodation_tenants" to "authenticated";

grant update on table "public"."accommodation_tenants" to "authenticated";

grant delete on table "public"."accommodation_tenants" to "service_role";

grant insert on table "public"."accommodation_tenants" to "service_role";

grant references on table "public"."accommodation_tenants" to "service_role";

grant select on table "public"."accommodation_tenants" to "service_role";

grant trigger on table "public"."accommodation_tenants" to "service_role";

grant truncate on table "public"."accommodation_tenants" to "service_role";

grant update on table "public"."accommodation_tenants" to "service_role";

grant delete on table "public"."accommodations" to "anon";

grant insert on table "public"."accommodations" to "anon";

grant references on table "public"."accommodations" to "anon";

grant select on table "public"."accommodations" to "anon";

grant trigger on table "public"."accommodations" to "anon";

grant truncate on table "public"."accommodations" to "anon";

grant update on table "public"."accommodations" to "anon";

grant delete on table "public"."accommodations" to "authenticated";

grant insert on table "public"."accommodations" to "authenticated";

grant references on table "public"."accommodations" to "authenticated";

grant select on table "public"."accommodations" to "authenticated";

grant trigger on table "public"."accommodations" to "authenticated";

grant truncate on table "public"."accommodations" to "authenticated";

grant update on table "public"."accommodations" to "authenticated";

grant delete on table "public"."accommodations" to "service_role";

grant insert on table "public"."accommodations" to "service_role";

grant references on table "public"."accommodations" to "service_role";

grant select on table "public"."accommodations" to "service_role";

grant trigger on table "public"."accommodations" to "service_role";

grant truncate on table "public"."accommodations" to "service_role";

grant update on table "public"."accommodations" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."interests" to "anon";

grant insert on table "public"."interests" to "anon";

grant references on table "public"."interests" to "anon";

grant select on table "public"."interests" to "anon";

grant trigger on table "public"."interests" to "anon";

grant truncate on table "public"."interests" to "anon";

grant update on table "public"."interests" to "anon";

grant delete on table "public"."interests" to "authenticated";

grant insert on table "public"."interests" to "authenticated";

grant references on table "public"."interests" to "authenticated";

grant select on table "public"."interests" to "authenticated";

grant trigger on table "public"."interests" to "authenticated";

grant truncate on table "public"."interests" to "authenticated";

grant update on table "public"."interests" to "authenticated";

grant delete on table "public"."interests" to "service_role";

grant insert on table "public"."interests" to "service_role";

grant references on table "public"."interests" to "service_role";

grant select on table "public"."interests" to "service_role";

grant trigger on table "public"."interests" to "service_role";

grant truncate on table "public"."interests" to "service_role";

grant update on table "public"."interests" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."spatial_ref_sys" to "anon";

grant insert on table "public"."spatial_ref_sys" to "anon";

grant references on table "public"."spatial_ref_sys" to "anon";

grant select on table "public"."spatial_ref_sys" to "anon";

grant trigger on table "public"."spatial_ref_sys" to "anon";

grant truncate on table "public"."spatial_ref_sys" to "anon";

grant update on table "public"."spatial_ref_sys" to "anon";

grant delete on table "public"."spatial_ref_sys" to "authenticated";

grant insert on table "public"."spatial_ref_sys" to "authenticated";

grant references on table "public"."spatial_ref_sys" to "authenticated";

grant select on table "public"."spatial_ref_sys" to "authenticated";

grant trigger on table "public"."spatial_ref_sys" to "authenticated";

grant truncate on table "public"."spatial_ref_sys" to "authenticated";

grant update on table "public"."spatial_ref_sys" to "authenticated";

grant delete on table "public"."spatial_ref_sys" to "postgres";

grant insert on table "public"."spatial_ref_sys" to "postgres";

grant references on table "public"."spatial_ref_sys" to "postgres";

grant select on table "public"."spatial_ref_sys" to "postgres";

grant trigger on table "public"."spatial_ref_sys" to "postgres";

grant truncate on table "public"."spatial_ref_sys" to "postgres";

grant update on table "public"."spatial_ref_sys" to "postgres";

grant delete on table "public"."spatial_ref_sys" to "service_role";

grant insert on table "public"."spatial_ref_sys" to "service_role";

grant references on table "public"."spatial_ref_sys" to "service_role";

grant select on table "public"."spatial_ref_sys" to "service_role";

grant trigger on table "public"."spatial_ref_sys" to "service_role";

grant truncate on table "public"."spatial_ref_sys" to "service_role";

grant update on table "public"."spatial_ref_sys" to "service_role";

grant delete on table "public"."user_interests" to "anon";

grant insert on table "public"."user_interests" to "anon";

grant references on table "public"."user_interests" to "anon";

grant select on table "public"."user_interests" to "anon";

grant trigger on table "public"."user_interests" to "anon";

grant truncate on table "public"."user_interests" to "anon";

grant update on table "public"."user_interests" to "anon";

grant delete on table "public"."user_interests" to "authenticated";

grant insert on table "public"."user_interests" to "authenticated";

grant references on table "public"."user_interests" to "authenticated";

grant select on table "public"."user_interests" to "authenticated";

grant trigger on table "public"."user_interests" to "authenticated";

grant truncate on table "public"."user_interests" to "authenticated";

grant update on table "public"."user_interests" to "authenticated";

grant delete on table "public"."user_interests" to "service_role";

grant insert on table "public"."user_interests" to "service_role";

grant references on table "public"."user_interests" to "service_role";

grant select on table "public"."user_interests" to "service_role";

grant trigger on table "public"."user_interests" to "service_role";

grant truncate on table "public"."user_interests" to "service_role";

grant update on table "public"."user_interests" to "service_role";

create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));



