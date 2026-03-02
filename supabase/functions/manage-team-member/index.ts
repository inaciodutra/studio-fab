import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "change_role" | "remove_member";
type AppRole = "ADMIN" | "OPERADOR" | "VISUALIZADOR";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse(500, { error: "Supabase env not configured" });
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !authData.user) return jsonResponse(401, { error: "Unauthorized" });
    const requesterId = authData.user.id;

    const { data: requesterRoles, error: requesterRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requesterId);
    if (requesterRoleError) return jsonResponse(500, { error: requesterRoleError.message });
    const isAdmin = (requesterRoles ?? []).some((r) => r.role === "ADMIN");
    if (!isAdmin) return jsonResponse(403, { error: "Apenas admins podem gerenciar membros" });

    const { data: requesterProfile, error: requesterProfileError } = await supabaseAdmin
      .from("profiles")
      .select("workspace_id")
      .eq("id", requesterId)
      .single();
    if (requesterProfileError || !requesterProfile?.workspace_id) return jsonResponse(403, { error: "Workspace do admin nao encontrado" });
    const workspaceId = requesterProfile.workspace_id;

    const payload = await req.json();
    const action = payload.action as Action;
    const memberId = payload.member_id as string;
    const newRole = payload.new_role as AppRole | undefined;

    if (!action || !memberId) return jsonResponse(400, { error: "Requisicao invalida" });
    if (!["change_role", "remove_member"].includes(action)) return jsonResponse(400, { error: "Acao invalida" });
    if (memberId === requesterId) return jsonResponse(400, { error: "Nao e permitido alterar a propria conta por esta acao" });

    const { data: memberProfile, error: memberProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, workspace_id")
      .eq("id", memberId)
      .single();
    if (memberProfileError || !memberProfile) return jsonResponse(404, { error: "Membro nao encontrado" });
    if (memberProfile.workspace_id !== workspaceId) return jsonResponse(403, { error: "Membro fora do workspace do admin" });

    const { data: workspaceProfiles, error: workspaceProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("workspace_id", workspaceId);
    if (workspaceProfilesError) return jsonResponse(500, { error: workspaceProfilesError.message });
    const memberIds = (workspaceProfiles ?? []).map((p) => p.id);

    const { data: workspaceRoles, error: workspaceRolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", memberIds);
    if (workspaceRolesError) return jsonResponse(500, { error: workspaceRolesError.message });

    const adminIds = new Set((workspaceRoles ?? []).filter((r) => r.role === "ADMIN").map((r) => r.user_id));
    const memberIsAdmin = adminIds.has(memberId);
    const adminCount = adminIds.size;

    if (action === "change_role") {
      if (!newRole || !["ADMIN", "OPERADOR", "VISUALIZADOR"].includes(newRole)) {
        return jsonResponse(400, { error: "Papel invalido" });
      }
      if (memberIsAdmin && adminCount <= 1 && newRole !== "ADMIN") {
        return jsonResponse(400, { error: "Nao e permitido rebaixar o ultimo admin do workspace" });
      }

      const { error: delError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", memberId);
      if (delError) return jsonResponse(500, { error: delError.message });
      const { error: insError } = await supabaseAdmin.from("user_roles").insert({ user_id: memberId, role: newRole });
      if (insError) return jsonResponse(500, { error: insError.message });

      return jsonResponse(200, { success: true, message: "Papel atualizado" });
    }

    if (memberIsAdmin && adminCount <= 1) {
      return jsonResponse(400, { error: "Nao e permitido remover o ultimo admin do workspace" });
    }

    const { data: targetUserData } = await supabaseAdmin.auth.admin.getUserById(memberId);
    const targetEmail = targetUserData?.user?.email ?? memberProfile.name;

    const { data: newWorkspace, error: newWorkspaceError } = await supabaseAdmin
      .from("workspaces")
      .insert({ name: targetEmail })
      .select("id")
      .single();
    if (newWorkspaceError || !newWorkspace) return jsonResponse(500, { error: newWorkspaceError?.message ?? "Falha ao criar novo workspace" });

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ workspace_id: newWorkspace.id })
      .eq("id", memberId);
    if (updateProfileError) return jsonResponse(500, { error: updateProfileError.message });

    const { error: roleDeleteError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", memberId);
    if (roleDeleteError) return jsonResponse(500, { error: roleDeleteError.message });

    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: memberId, role: "ADMIN" });
    if (roleInsertError) return jsonResponse(500, { error: roleInsertError.message });

    const { error: configError } = await supabaseAdmin.from("config").insert({ workspace_id: newWorkspace.id });
    if (configError) return jsonResponse(500, { error: configError.message });

    return jsonResponse(200, { success: true, message: "Membro removido da equipe atual com sucesso" });
  } catch (err) {
    console.error("manage-team-member error", err);
    return jsonResponse(500, { error: "Erro inesperado ao gerenciar membro" });
  }
});
