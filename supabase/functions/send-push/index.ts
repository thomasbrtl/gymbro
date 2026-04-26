// Supabase Edge Function — send-push
// Envoie une notification push Web via web-push

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push@3.6.7"

const VAPID_PUBLIC  = Deno.env.get("VAPID_PUBLIC_KEY")!
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!
const VAPID_EMAIL   = Deno.env.get("VAPID_EMAIL") || "mailto:admin@gymbro.app"

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

  const { userId, title, body, tag } = await req.json()
  if (!userId || !title) return new Response("Missing userId or title", { status: 400 })

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Récupère toutes les subscriptions de l'utilisateur
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId)

  if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 })

  const payload = JSON.stringify({ title, body: body || "", tag: tag || "gymbro", url: "/" })

  let sent = 0
  const dead: string[] = []

  for (const row of subs) {
    try {
      await webpush.sendNotification(row.subscription, payload)
      sent++
    } catch (e: any) {
      // 410 Gone = subscription expirée
      if (e.statusCode === 410 || e.statusCode === 404) {
        dead.push(JSON.stringify(row.subscription.endpoint))
      }
    }
  }

  // Nettoie les subscriptions mortes
  if (dead.length) {
    for (const ep of dead) {
      await supabase.from("push_subscriptions").delete()
        .eq("user_id", userId)
        .filter("subscription->endpoint", "eq", ep)
        .catch(() => {})
    }
  }

  return new Response(JSON.stringify({ sent }), { status: 200, headers: { "Content-Type": "application/json" } })
})
