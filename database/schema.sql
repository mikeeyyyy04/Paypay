create extension if not exists pgcrypto;
create extension if not exists citext;

create type student_status as enum ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED');
create type class_status as enum ('DRAFT', 'PUBLISHED', 'FULL', 'ARCHIVED', 'CANCELLED');
create type enrollment_status as enum ('PENDING_PAYMENT', 'ENROLLED', 'WAITLISTED', 'DROPPED', 'COMPLETED', 'CANCELLED');
create type order_status as enum ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED');
create type payment_status as enum ('PENDING', 'REVIEWING', 'PAID', 'FAILED', 'REJECTED', 'REFUNDED');
create type attendance_status as enum ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
create type announcement_audience as enum ('ALL', 'STUDENTS', 'ADMINS', 'CLASS');
create type notification_type as enum ('SYSTEM', 'ENROLLMENT', 'PAYMENT', 'ANNOUNCEMENT', 'ATTENDANCE');
create type contact_status as enum ('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM');
create type file_owner_type as enum ('USER', 'STUDENT', 'CLASS', 'ORDER', 'PAYMENT', 'ANNOUNCEMENT');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_name_not_blank check (length(trim(name)) > 0)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text not null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_full_name_not_blank check (length(trim(full_name)) > 0)
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_unique unique (user_id, role_id)
);

create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  student_number text not null unique,
  date_of_birth date,
  guardian_name text,
  guardian_email citext,
  guardian_phone text,
  status student_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_student_number_not_blank check (length(trim(student_number)) > 0)
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  instructor_name text not null,
  capacity integer not null,
  price_cents integer not null,
  currency char(3) not null default 'PHP',
  status class_status not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_capacity_positive check (capacity > 0),
  constraint classes_price_nonnegative check (price_cents >= 0),
  constraint classes_slug_not_blank check (length(trim(slug)) > 0),
  constraint classes_title_not_blank check (length(trim(title)) > 0)
);

create table schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Asia/Manila',
  meeting_url text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedules_time_valid check (ends_at > starts_at)
);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_code_not_blank check (length(trim(code)) > 0),
  constraint payment_methods_name_not_blank check (length(trim(name)) > 0)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references users(id) on delete set null,
  student_email citext not null,
  student_name text not null,
  status order_status not null default 'DRAFT',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  currency char(3) not null default 'PHP',
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_amounts_nonnegative check (subtotal_cents >= 0 and discount_cents >= 0 and total_cents >= 0),
  constraint orders_total_math check (total_cents = subtotal_cents - discount_cents),
  constraint orders_student_name_not_blank check (length(trim(student_name)) > 0)
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  title_snapshot text not null,
  unit_price_cents integer not null,
  quantity integer not null default 1,
  line_total_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_unique_class unique (order_id, class_id),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_amounts_valid check (unit_price_cents >= 0 and line_total_cents = unit_price_cents * quantity)
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  status enrollment_status not null default 'PENDING_PAYMENT',
  enrolled_at timestamptz,
  dropped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_unique_student_class unique (student_id, class_id)
);

create table file_uploads (
  id uuid primary key default gen_random_uuid(),
  uploaded_by_user_id uuid references users(id) on delete set null,
  class_id uuid references classes(id) on delete cascade,
  announcement_id uuid,
  owner_type file_owner_type not null,
  owner_id uuid not null,
  bucket text not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  checksum_sha256 text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint file_uploads_size_positive check (size_bytes > 0),
  constraint file_uploads_storage_path_not_blank check (length(trim(storage_path)) > 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_method_id uuid not null references payment_methods(id) on delete restrict,
  verified_by_user_id uuid references users(id) on delete set null,
  amount_cents integer not null,
  currency char(3) not null default 'PHP',
  status payment_status not null default 'PENDING',
  external_reference text,
  proof_file_id uuid references file_uploads(id) on delete set null,
  submitted_at timestamptz,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount_cents > 0),
  constraint payments_verified_requires_reviewer check (
    status not in ('PAID', 'REJECTED', 'REFUNDED') or verified_by_user_id is not null
  )
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  schedule_id uuid not null references schedules(id) on delete cascade,
  status attendance_status not null,
  checked_in_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_unique_student_schedule unique (schedule_id, student_id)
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  title text not null,
  body text not null,
  audience announcement_audience not null default 'ALL',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_title_not_blank check (length(trim(title)) > 0),
  constraint announcements_class_audience_check check (
    (audience = 'CLASS' and class_id is not null) or audience <> 'CLASS'
  )
);

alter table file_uploads
  add constraint file_uploads_announcement_fk
  foreign key (announcement_id) references announcements(id) on delete cascade;

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (length(trim(title)) > 0)
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  assigned_to_user_id uuid references users(id) on delete set null,
  name text not null,
  email citext not null,
  phone text,
  subject text not null,
  message text not null,
  status contact_status not null default 'NEW',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_not_blank check (length(trim(name)) > 0),
  constraint contacts_subject_not_blank check (length(trim(subject)) > 0),
  constraint contacts_message_not_blank check (length(trim(message)) > 0)
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_logs_action_not_blank check (length(trim(action)) > 0),
  constraint activity_logs_entity_type_not_blank check (length(trim(entity_type)) > 0)
);

create index users_email_idx on users(email);
create index user_roles_role_id_idx on user_roles(role_id);
create index students_status_idx on students(status);
create index classes_status_idx on classes(status);
create index classes_published_at_idx on classes(published_at);
create index schedules_class_starts_idx on schedules(class_id, starts_at);
create index schedules_starts_at_idx on schedules(starts_at);
create index payment_methods_is_active_idx on payment_methods(is_active);
create index orders_user_created_idx on orders(user_id, created_at desc);
create index orders_status_created_idx on orders(status, created_at desc);
create index orders_student_email_idx on orders(student_email);
create index order_items_class_id_idx on order_items(class_id);
create index enrollments_class_status_idx on enrollments(class_id, status);
create index enrollments_student_status_idx on enrollments(student_id, status);
create index enrollments_order_id_idx on enrollments(order_id);
create index payments_order_id_idx on payments(order_id);
create index payments_payment_method_id_idx on payments(payment_method_id);
create index payments_status_created_idx on payments(status, created_at desc);
create index payments_verified_by_user_id_idx on payments(verified_by_user_id);
create index attendance_enrollment_id_idx on attendance(enrollment_id);
create index attendance_student_status_idx on attendance(student_id, status);
create index announcements_class_published_idx on announcements(class_id, published_at desc);
create index announcements_audience_published_idx on announcements(audience, published_at desc);
create index notifications_user_read_idx on notifications(user_id, read_at);
create index notifications_type_created_idx on notifications(type, created_at desc);
create index file_uploads_owner_idx on file_uploads(owner_type, owner_id);
create index file_uploads_uploaded_by_user_id_idx on file_uploads(uploaded_by_user_id);
create index file_uploads_class_id_idx on file_uploads(class_id);
create index contacts_status_created_idx on contacts(status, created_at desc);
create index contacts_email_idx on contacts(email);
create index activity_logs_actor_created_idx on activity_logs(actor_user_id, created_at desc);
create index activity_logs_entity_idx on activity_logs(entity_type, entity_id);
create index activity_logs_created_at_idx on activity_logs(created_at desc);
create index activity_logs_metadata_gin_idx on activity_logs using gin(metadata);
create index notifications_data_gin_idx on notifications using gin(data);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles', 'users', 'user_roles', 'students', 'classes', 'schedules',
    'payment_methods', 'orders', 'order_items', 'enrollments', 'file_uploads',
    'payments', 'attendance', 'announcements', 'notifications', 'contacts',
    'activity_logs'
  ]
  loop
    execute format(
      'create trigger %I before update on %I for each row execute function set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end;
$$;

insert into roles (name, description)
values
  ('Admin', 'Full administrative access'),
  ('Student', 'Student self-service access')
on conflict (name) do nothing;

create or replace function current_user_has_role(role_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = role_name
  );
$$;

create or replace function current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select current_user_has_role('Admin');
$$;

alter table users enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table students enable row level security;
alter table classes enable row level security;
alter table schedules enable row level security;
alter table payment_methods enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table enrollments enable row level security;
alter table file_uploads enable row level security;
alter table payments enable row level security;
alter table attendance enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table contacts enable row level security;
alter table activity_logs enable row level security;
