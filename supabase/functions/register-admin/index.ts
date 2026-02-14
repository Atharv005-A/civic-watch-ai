import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, registrationKey, role, isAdminCreating } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // If admin is creating a user from the panel, verify they are an admin
    if (isAdminCreating) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Not authenticated' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !callerUser) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify caller is admin
      const { data: callerRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', callerUser.id)
        .single();

      if (callerRole?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Only admins can create users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Standard admin registration via key
      const adminKey = Deno.env.get('ADMIN_REGISTRATION_KEY');
      if (!adminKey || registrationKey !== adminKey) {
        return new Response(
          JSON.stringify({ error: 'Invalid registration key' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const targetRole = isAdminCreating ? (role || 'citizen') : 'admin';

    // Create user
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (signUpError) {
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user role
    if (targetRole !== 'citizen') {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: targetRole })
        .eq('user_id', userData.user.id);

      if (roleError) {
        console.error('Role update error:', roleError);
        await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: userData.user.id, role: targetRole });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `User created successfully with role: ${targetRole}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
