import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return new Response("Unauthorized", { status: 401 })
  const supabaseUser = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } })
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) return new Response("Unauthorized", { status: 401 })
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  const uid = user.id
  await supabaseAdmin.from("notifications").delete().eq("user_id", uid)
  await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", uid)
  await supabaseAdmin.from("referrals").delete().or(`referrer_id.eq.${uid},referred_id.eq.${uid}`)
  await supabaseAdmin.from("solo_challenges").delete().eq("user_id", uid)
  await supabaseAdmin.from("challenges").delete().or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`)
  await supabaseAdmin.from("follows").delete().or(`follower_id.eq.${uid},following_id.eq.${uid}`)
  await supabaseAdmin.from("messages").delete().or(`from_id.eq.${uid},to_id.eq.${uid}`)
  await supabaseAdmin.from("session_history").delete().eq("user_id", uid)
  await supabaseAdmin.from("posts").delete().eq("user_id", uid)
  await supabaseAdmin.from("profiles").delete().eq("id", uid)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(uid)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } })
})
