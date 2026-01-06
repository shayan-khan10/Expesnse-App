# DATABASE CONTRACT — Expense App

This document freezes the **database contract** for the Expense App.
If frontend code breaks, the database is assumed correct.
If requirements change, this document must be updated **before** code.

---

## 1. Core Domain Model (Non‑Negotiable)

* **Family is the root context**
* Every meaningful record is scoped to a `family_id`
* Users belong to **exactly one family** at a time
* Security is enforced **only at the database level** via RLS

---

## 2. Tables

### 2.1 `profiles` — User Identity

**Purpose**: Holds display-level user data. Created automatically on signup.

| Column     | Type        | Notes                  |
| ---------- | ----------- | ---------------------- |
| id         | uuid        | PK, FK → auth.users.id |
| username   | text        | NOT NULL, UNIQUE       |
| avatar_url | text        | nullable               |
| created_at | timestamptz | default now()          |

**Rules**

* Users can only update their own profile
* Profiles are not family‑scoped

---

### 2.2 `families` — Root Aggregate

**Purpose**: Defines the accounting and access scope.

| Column                 | Type        | Notes                         |
| ---------------------- | ----------- | ----------------------------- |
| id                     | uuid        | PK, default gen_random_uuid() |
| name                   | text        | NOT NULL                      |
| join_code              | text        | NOT NULL, UNIQUE, length ≥ 6  |
| monthly_spending_limit | numeric     | nullable, ≥ 0                 |
| created_at             | timestamptz | default now()                 |

**Rules**

* Families are never directly deleted by users
* Membership is managed via `family_members`

---

### 2.3 `family_members` — Access Control Table

**Purpose**: Links users to families and defines roles.

| Column    | Type        | Notes                              |
| --------- | ----------- | ---------------------------------- |
| user_id   | uuid        | PK (composite), FK → auth.users.id |
| family_id | uuid        | PK (composite), FK → families.id   |
| role      | text        | CHECK ('admin','member')           |
| joined_at | timestamptz | default now()                      |

**Rules**

* A user can belong to **only one family**
* At least one admin must exist per family
* Admin transfer and family deletion are enforced via trigger

---

### 2.4 `categories` — Shared Classification

**Purpose**: Expense categories shared by the family.

| Column     | Type        | Notes                         |
| ---------- | ----------- | ----------------------------- |
| id         | uuid        | PK, default gen_random_uuid() |
| family_id  | uuid        | FK → families.id              |
| name       | text        | NOT NULL                      |
| created_at | timestamptz | default now()                 |

**Rules**

* Categories are **family‑wide**
* Only admins may create, update, or delete categories

---

### 2.5 `expenses` — Financial Records

**Purpose**: Core transactional data.

| Column         | Type        | Notes                         |
| -------------- | ----------- | ----------------------------- |
| id             | uuid        | PK, default gen_random_uuid() |
| user_id        | uuid        | FK → auth.users.id            |
| family_id      | uuid        | FK → families.id              |
| category_id    | uuid        | FK → categories.id            |
| amount         | numeric     | NOT NULL, > 0                 |
| payment_method | text        | nullable ('cash','online')    |
| note           | text        | nullable                      |
| created_at     | timestamptz | default now()                 |

**Rules**

* Expenses are family‑scoped
* Only the creator may update or delete their expense
* All family members may view all expenses

---

## 3. Row Level Security (RLS)

### 3.1 Profiles

* SELECT: own profile or family members
* UPDATE: own profile only

### 3.2 Families

* SELECT: family members
* UPDATE: admins only (`USING` + `WITH CHECK`)

### 3.3 Family Members

* SELECT: same family
* INSERT / UPDATE / DELETE: admins only

### 3.4 Categories

* SELECT: family members
* INSERT / DELETE: admins only (UPDATE not supported)

> **CATEGORIES CONTRACT**
> * Categories are family-scoped
> * Client code must never query categories directly
> * All access must go through RPCs

### 3.5 Expenses

* SELECT: family members
* INSERT: own expense, own family
* UPDATE / DELETE: owner only

**Important Rule**:
`USING` controls *which rows are visible*.
`WITH CHECK` controls *what mutations are allowed*.

---

## 4. Functions

### 4.1 `handle_new_user`

**Purpose**: Automatically create profile on signup.

* Triggered on `auth.users` insert
* SECURITY DEFINER
* Fixed `search_path`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NULL);
  RETURN NEW;
END;
$$;
```

---

### 4.2 `handle_admin_leave`

**Purpose**: Maintain family invariants when an admin leaves.

Logic:

1. If admin leaves and no members remain → delete family
2. If admin leaves and members remain → promote oldest member

```sql
CREATE OR REPLACE FUNCTION public.handle_admin_leave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining_members_count INT;
  remaining_admins_count  INT;
  new_admin_user_id       UUID;
BEGIN
  IF OLD.role <> 'admin' THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO remaining_members_count
  FROM public.family_members
  WHERE family_id = OLD.family_id;

  IF remaining_members_count = 0 THEN
    DELETE FROM public.families WHERE id = OLD.family_id;
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO remaining_admins_count
  FROM public.family_members
  WHERE family_id = OLD.family_id AND role = 'admin';

  IF remaining_admins_count = 0 THEN
    SELECT user_id INTO new_admin_user_id
    FROM public.family_members
    WHERE family_id = OLD.family_id
    ORDER BY joined_at ASC
    LIMIT 1;

    UPDATE public.family_members
    SET role = 'admin'
    WHERE family_id = OLD.family_id AND user_id = new_admin_user_id;
  END IF;

  RETURN NULL;
END;
$$;
```

---

## 5. RPC Functions

This application **does not rely on direct table access for identity, membership, or joins**.
All sensitive flows are mediated through **RPC functions** to avoid PostgREST + RLS recursion,
ensure atomicity, and keep business rules centralized in the database.

---

### 5.1 `get_my_context`

**Purpose**: Canonical identity bootstrap for the application.

Returns the authenticated user's:

* profile information
* family membership (if any)
* role within the family

This RPC **replaces all direct queries** to `profiles` and `family_members` during app initialization.

**Why this exists**:

* Prevents PostgREST + RLS recursion (500 errors)
* Eliminates frontend filtering by `auth.uid()`
* Guarantees a single, consistent identity snapshot

```sql
CREATE OR REPLACE FUNCTION public.get_my_context()
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  family_id uuid,
  role text,
  family_name text,
  join_code text,
  monthly_spending_limit numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    fm.family_id,
    fm.role,
    f.name,
    f.join_code,
    f.monthly_spending_limit
  FROM public.profiles p
  LEFT JOIN public.family_members fm
    ON fm.user_id = p.id
  LEFT JOIN public.families f
    ON f.id = fm.family_id
  WHERE p.id = auth.uid();
$$;
```

---

### 5.2 `create_family`

**Purpose**: Atomically create a family and assign the creator as admin.

This RPC:

* Generates a unique join code
* Creates the family
* Inserts the creator into `family_members` as `admin`

All steps run in **one transaction**.

```sql
CREATE OR REPLACE FUNCTION public.create_family(
  family_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_family_id uuid;
  new_join_code text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User already belongs to a family';
  END IF;

  LOOP
    new_join_code := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.families WHERE join_code = new_join_code
    );
  END LOOP;

  INSERT INTO public.families (name, join_code)
  VALUES (family_name, new_join_code)
  RETURNING id INTO new_family_id;

  INSERT INTO public.family_members (user_id, family_id, role)
  VALUES (auth.uid(), new_family_id, 'admin');

  RETURN new_family_id;
END;
$$;
```

---

### 5.3 `join_family`

**Purpose**: Allow a user to join a family using a join code **without weakening RLS**.

Direct inserts into `family_members` are intentionally blocked by policy.
This RPC is the **only supported join mechanism**.

```sql
CREATE OR REPLACE FUNCTION public.join_family(
  input_join_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_family_id uuid;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User already belongs to a family';
  END IF;

  SELECT id
  INTO target_family_id
  FROM public.families
  WHERE join_code = input_join_code;

  IF target_family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid join code';
  END IF;

  INSERT INTO public.family_members (user_id, family_id, role)
  VALUES (auth.uid(), target_family_id, 'member');

  RETURN target_family_id;
END;
$$;
```

---

### 5.4 `leave_family`

**Purpose**: Allow a user to leave their family safely.

All admin-transfer and family-deletion logic is enforced by triggers.

```sql
CREATE OR REPLACE FUNCTION public.leave_family()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.family_members
  WHERE user_id = auth.uid();
END;
$$;
```

---

### 5.5 `generate_family_join_code`

**Purpose**: Securely generate a unique join code for family creation or regeneration.

* Must be called **server-side only** (or from admin-only flow)
* Guarantees uniqueness
* Encapsulates join code logic in DB

```sql
CREATE OR REPLACE FUNCTION public.generate_family_join_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.families WHERE join_code = new_code
    );
  END LOOP;
  RETURN new_code;
END;
$$;
```

### 5.6 `get_family_members`

**Purpose**: Get family members for the current user's family.

* Must be called **server-side only** (or from admin-only flow)
* Encapsulates family member logic in DB

```sql
CREATE OR REPLACE FUNCTION public.get_family_members()
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  role text,
  joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    fm.role,
    fm.joined_at
  FROM public.family_members fm
  JOIN public.profiles p ON p.id = fm.user_id
  WHERE fm.family_id = (
    SELECT family_id
    FROM public.family_members
    WHERE user_id = auth.uid()
  );
$$;
```

---

### 5.7 `update_family`

**Purpose**: Update family details (Admins only).

```sql
CREATE OR REPLACE FUNCTION public.update_family(
  new_name text DEFAULT NULL,
  new_limit numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict check: Only Admin can update
  IF NOT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update family details';
  END IF;

  UPDATE public.families
  SET
    name = COALESCE(new_name, name),
    monthly_spending_limit = COALESCE(new_limit, monthly_spending_limit)
  WHERE id = (
    SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
  );
END;
$$;
```

### 5.8 `delete_family`

**Purpose**: Delete the current family (Admins only).

```sql
CREATE OR REPLACE FUNCTION public.delete_family()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_family_id uuid;
BEGIN
  -- Strict check: Only Admin can delete
  SELECT family_id INTO current_family_id
  FROM public.family_members
  WHERE user_id = auth.uid() AND role = 'admin';

  IF current_family_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can delete the family';
  END IF;

  DELETE FROM public.families WHERE id = current_family_id;
END;
$$;
```

### 5.9 `kick_member`

**Purpose**: Remove a member from the family (Admins only).

```sql
CREATE OR REPLACE FUNCTION public.kick_member(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_family_id uuid;
BEGIN
  -- Get my family ID if I am admin
  SELECT family_id INTO my_family_id
  FROM public.family_members
  WHERE user_id = auth.uid() AND role = 'admin';

  IF my_family_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can manage members';
  END IF;

  -- Ensure target is in SAME family
  IF NOT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = target_user_id AND family_id = my_family_id
  ) THEN
    RAISE EXCEPTION 'User is not in your family';
  END IF;

  DELETE FROM public.family_members WHERE user_id = target_user_id;
END;
$$;
```

### 5.10 `update_member_role`

**Purpose**: Update a member's role (Admins only).

```sql
CREATE OR REPLACE FUNCTION public.update_member_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_family_id uuid;
BEGIN
  -- Get my family ID if I am admin
  SELECT family_id INTO my_family_id
  FROM public.family_members
  WHERE user_id = auth.uid() AND role = 'admin';

  IF my_family_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can manage members';
  END IF;

  -- Ensure target is in SAME family
  IF NOT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = target_user_id AND family_id = my_family_id
  ) THEN
    RAISE EXCEPTION 'User is not in your family';
  END IF;
  
  UPDATE public.family_members
  SET role = new_role
  WHERE user_id = target_user_id;
END;
$$;
```

### 5.11 `regenerate_family_code`

**Purpose**: specific RPC to regenerate join code (Admins only).

```sql
CREATE OR REPLACE FUNCTION public.regenerate_family_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  my_family_id uuid;
BEGIN
  -- Check admin
  SELECT family_id INTO my_family_id
  FROM public.family_members
  WHERE user_id = auth.uid() AND role = 'admin';

  IF my_family_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can regenerate join codes';
  END IF;

  -- Generate
  new_code := public.generate_family_join_code();

  -- Update
  UPDATE public.families
  SET join_code = new_code
  WHERE id = my_family_id;

  RETURN new_code;
END;
$$;
```

---

### 5.12 `get_categories_for_my_family`

**Purpose**: Fetch all categories for the user's current family.

```sql
create or replace function get_categories_for_my_family()
returns setof categories
language sql
security definer
as $$
  select c.*
  from categories c
  join family_members fm on fm.family_id = c.family_id
  where fm.user_id = auth.uid();
$$;
```

### 5.13 `create_category_for_my_family`

**Purpose**: Create a new category linked to the user's family.

```sql
create or replace function create_category_for_my_family(
  category_name text
)
returns categories
language plpgsql
security definer
as $$
declare
  fam_id uuid;
  new_category categories;
begin
  select family_id into fam_id
  from family_members
  where user_id = auth.uid();

  if fam_id is null then
    raise exception 'User has no family';
  end if;

  insert into categories (name, family_id)
  values (category_name, fam_id)
  returning * into new_category;

  return new_category;
end;
$$;
```

### 5.14 `delete_category_for_my_family`

**Purpose**: Delete a category if it belongs to the user's family.

```sql
create or replace function delete_category_for_my_family(
  category_id uuid
)
returns void
language sql
security definer
as $$
  delete from categories
  where id = category_id
  and family_id in (
    select family_id from family_members where user_id = auth.uid()
  );
$$;

### 5.15 `get_expenses_dashboard_context`

**Purpose**: Single source of truth for the expenses dashboard page.

> **Design Note**: `get_expenses_dashboard_context` is intentionally a dashboard-only RPC, optimized for initial page load. If pagination, filtering, or analytics expand, additional RPCs (e.g. `get_personal_expenses_paginated`) will be introduced.

* Returns family info, personal total, family total, recent family expenses (limit 5), and personal expenses.
* No client filters.
* No RLS footguns.

```sql
create or replace function get_expenses_dashboard_context()
returns json
language plpgsql
security definer
as $$
declare
  ctx json;
begin
  select json_build_object(
    'family', json_build_object(
      'id', f.id,
      'name', f.name,
      'spending_limit', f.spending_limit
    ),

    'personal_total', (
      select coalesce(sum(e.amount), 0)
      from expenses e
      where e.user_id = auth.uid()
    ),

    'family_total', (
      select coalesce(sum(e.amount), 0)
      from expenses e
      where e.family_id = f.id
    ),

    'recent_family_expenses', (
      select coalesce(json_agg(r), '[]'::json)
      from (
        select
          e.id,
          e.expense_title,
          e.amount,
          e.created_at,
          p.username
        from expenses e
        join profiles p on p.id = e.user_id
        where e.family_id = f.id
        order by e.created_at desc
        limit 5
      ) r
    ),

    'personal_expenses', (
      select coalesce(json_agg(e), '[]'::json)
      from (
        select
          e.id,
          e.expense_title,
          e.amount,
          e.note,
          e.payment_method,
          e.category_id,
          e.created_at
        from expenses e
        where e.user_id = auth.uid()
        order by e.created_at desc
      ) e
    )
  )
  into ctx
  from families f
  join family_members fm on fm.family_id = f.id
  where fm.user_id = auth.uid()
  limit 1;

  return ctx;
end;
$$;
```

### 5.16 `delete_my_expense`

**Purpose**: Delete only expenses owned by the user.

* Ownership enforced in DB.

```sql
create or replace function delete_my_expense(expense_id uuid)
returns void
language sql
security definer
as $$
  delete from expenses
  where id = expense_id
    and user_id = auth.uid();
$$;
```
```

---

## 6. Triggers

### `trg_handle_admin_leave`

```sql
CREATE TRIGGER trg_handle_admin_leave
AFTER DELETE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_leave();
```

---

## 6. Application Flow (DB‑Centric)

### Signup

1. User signs up via Supabase Auth
2. `handle_new_user` creates profile
3. User has no family → app blocks expenses/categories

### Family Creation / Join

1. Admin creates family (server‑side)
2. Admin inserted into `family_members`
3. Other users join via `join_code` → admin inserts row

### Daily Usage

* Categories read by all members
* Expenses created by members
* All expense reads are family‑wide

### Leaving a Family

* Member leaves → row deleted
* Admin leaves → trigger enforces admin continuity or deletes family

---

## 7. Invariants (Never Break These)

* A user belongs to at most one family
* A family always has ≥ 1 admin unless deleted
* Members cannot mutate shared structures
* Frontend never enforces security — DB does

---

## 8. Refactor Rule

> **If frontend logic conflicts with this document, the frontend is wrong.**

Any change to behavior requires:

1. Updating this file
2. Updating RLS / triggers
3. Only then updating UI

---

**Status**: Frozen ✔
