
-- Create invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'OPERADOR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(workspace_id, email)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins of the workspace can manage invitations
CREATE POLICY "Admins can view workspace invitations"
ON public.invitations FOR SELECT
USING (workspace_id = get_user_workspace_id());

CREATE POLICY "Admins can insert invitations"
ON public.invitations FOR INSERT
WITH CHECK (workspace_id = get_user_workspace_id() AND has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can update invitations"
ON public.invitations FOR UPDATE
USING (workspace_id = get_user_workspace_id() AND has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can delete invitations"
ON public.invitations FOR DELETE
USING (workspace_id = get_user_workspace_id() AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Allow new users (not yet in a workspace) to read their own invitations by email
CREATE POLICY "Users can view own invitations by email"
ON public.invitations FOR SELECT
USING (lower(email) = lower(auth.jwt()->>'email') AND status = 'pending');

-- Replace handle_new_user to check for pending invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
  new_workspace_id UUID;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  
  -- Check for pending invitation
  SELECT * INTO invite_record
  FROM public.invitations
  WHERE lower(email) = lower(user_email) AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invite_record IS NOT NULL THEN
    -- Join existing workspace
    INSERT INTO public.profiles (id, workspace_id, name)
    VALUES (NEW.id, invite_record.workspace_id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_record.role);
    
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invite_record.id;
  ELSE
    -- Create new workspace (original behavior)
    INSERT INTO public.workspaces (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
    RETURNING id INTO new_workspace_id;
    
    INSERT INTO public.profiles (id, workspace_id, name)
    VALUES (NEW.id, new_workspace_id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'ADMIN');
    
    INSERT INTO public.config (workspace_id)
    VALUES (new_workspace_id);
  END IF;
  
  RETURN NEW;
END;
$$;
