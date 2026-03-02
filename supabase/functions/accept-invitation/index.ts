import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get current user
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invitation_id, action } = await req.json();

    if (!invitation_id || !["accept", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Fetch invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("id", invitation_id)
      .eq("status", "pending")
      .single();

    if (invError || !invitation) {
      return new Response(JSON.stringify({ error: "Convite não encontrado ou já processado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the invitation email matches the user
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Este convite não é para sua conta" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      const { error: rejectError } = await supabaseAdmin
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", invitation_id);
      if (rejectError) {
        return new Response(JSON.stringify({ error: rejectError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, message: "Convite recusado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // action === "accept"
    // Get current user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("workspace_id")
      .eq("id", user.id)
      .single();

    const oldWorkspaceId = profile?.workspace_id;
    const newWorkspaceId = invitation.workspace_id;

    // 1. Update user's profile to new workspace
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ workspace_id: newWorkspaceId })
      .eq("id", user.id);
    if (updateProfileError) {
      return new Response(JSON.stringify({ error: updateProfileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Delete old roles and assign new role
    const { error: roleDeleteError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);
    if (roleDeleteError) {
      return new Response(JSON.stringify({ error: roleDeleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
      user_id: user.id,
      role: invitation.role,
    });
    if (roleInsertError) {
      return new Response(JSON.stringify({ error: roleInsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Mark invitation as accepted
    const { error: invitationUpdateError } = await supabaseAdmin
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invitation_id);
    if (invitationUpdateError) {
      return new Response(JSON.stringify({ error: invitationUpdateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Clean up old workspace if empty
    if (oldWorkspaceId && oldWorkspaceId !== newWorkspaceId) {
      const { data: remainingMembers } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("workspace_id", oldWorkspaceId);

      if (!remainingMembers || remainingMembers.length === 0) {
        // Delete config, then workspace
        await supabaseAdmin.from("config").delete().eq("workspace_id", oldWorkspaceId);
        await supabaseAdmin.from("workspaces").delete().eq("id", oldWorkspaceId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Convite aceito! Você agora faz parte do novo workspace." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
