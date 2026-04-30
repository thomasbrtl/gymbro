import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
      }
    })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) return new Response("No signature", { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature failed:", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const customerEmail = session.customer_details?.email || session.customer_email
    console.log("Payment completed for:", customerEmail)

    if (!customerEmail) {
      return new Response("No email", { status: 400 })
    }

    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .limit(1)

    if (!users?.length) {
      console.error("User not found:", customerEmail)
      return new Response("User not found", { status: 404 })
    }

    const userId = users[0].id
    const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await supabase.from("profiles").update({ is_premium: true, premium_until: premiumUntil }).eq("id", userId)
    await supabase.from("notifications").insert({ user_id: userId, from_id: userId, type: "premium_activated" })
    console.log("Premium activated for", customerEmail, "until", premiumUntil)
  }

  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    const obj = event.data.object as any
    const customerEmail = obj.customer_email || obj?.customer_details?.email
    if (customerEmail) {
      await supabase.from("profiles").update({ is_premium: false, premium_until: null }).eq("email", customerEmail)
      console.log("Premium revoked for", customerEmail)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}, {
  // Disable JWT verification — Stripe webhooks don't have Supabase JWT
})
