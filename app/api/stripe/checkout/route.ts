import Stripe from "stripe";
import { createUserSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  // Authenticate the caller via their Supabase JWT
  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();
  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createUserSupabase(accessToken);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const origin = request.headers.get("origin") ?? "https://bridgecrossbio.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email,
    metadata: { supabase_user_id: user.id },
    subscription_data: { metadata: { supabase_user_id: user.id } },
    success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  return Response.json({ url: session.url });
}
