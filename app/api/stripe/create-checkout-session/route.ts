import Stripe from "stripe";

export async function POST(request: Request) {
  console.log("[stripe/create-checkout-session] Key present:", !!process.env.STRIPE_SECRET_KEY);
  console.log("[stripe/create-checkout-session] Price ID:", process.env.STRIPE_PRICE_ID);

  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      customer_email: email,
      subscription_data: {
        trial_period_days: 14,
        metadata: { customer_email: email },
      },
      allow_promotion_codes: true,
      success_url: "https://map.bridgecross.bio/auth?verified=true",
      cancel_url: "https://map.bridgecross.bio",
    });

    console.log("[stripe/create-checkout-session] Session created:", session.id);
    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/create-checkout-session] Stripe error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
