import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user from Supabase auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Verify user is on Core tier
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_tier, email")
      .eq("id", user.id)
      .single();

    if (!userData || userData.subscription_tier !== "core") {
      return res
        .status(403)
        .json({ error: "Must be on Core tier to purchase add-on" });
    }

    // Check if already has active subscription
    const { data: existingSub } = await supabase
      .from("user_swing_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (existingSub) {
      return res
        .status(400)
        .json({ error: "Already has active subscription" });
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: userData.email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_SWING_ANALYTICS_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: user.id,
          product_type: "swing_analytics_addon",
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/swing-analytics?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/swing-analytics?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        product_type: "swing_analytics_addon",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: error.message });
  }
}