
-- Allow admins to delete profiles in their workspace
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (workspace_id = get_user_workspace_id() AND has_role(auth.uid(), 'ADMIN'::app_role) AND id != auth.uid());
