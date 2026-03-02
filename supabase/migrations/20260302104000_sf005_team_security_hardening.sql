-- SF-005: team governance hardening

-- Invitations: only admins can list workspace invitations
DROP POLICY IF EXISTS "Admins can view workspace invitations" ON public.invitations;
CREATE POLICY "Admins can view workspace invitations"
ON public.invitations
FOR SELECT
USING (
  workspace_id = get_user_workspace_id()
  AND has_role(auth.uid(), 'ADMIN'::app_role)
);

-- user_roles: scope visibility/management to same workspace
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view workspace roles"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.workspace_id = get_user_workspace_id()
  )
);

CREATE POLICY "Admins can insert workspace roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'ADMIN'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.workspace_id = get_user_workspace_id()
  )
);

CREATE POLICY "Admins can update workspace roles"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.workspace_id = get_user_workspace_id()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'ADMIN'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.workspace_id = get_user_workspace_id()
  )
);

CREATE POLICY "Admins can delete workspace roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.workspace_id = get_user_workspace_id()
  )
);
