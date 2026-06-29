import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Upsert subscription record
  const { error } = await supabase
    .from("user_swing_subscriptions")
    .upsert(
      {
        user_id: userId,
        tier: "core_addon",
        is_active: isActive,
        stripe_subscription_id: subscription.id,
        data_retention_months: 3,
        max_sessions_per_month: null, // Unlimited
        end_date: currentPeriodEnd.toISOString().split("T")[0],
        last_payment_date: new Date().toISOString().split("T")[0],
        next_payment_date: currentPeriodEnd.toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,is_active",
      }
    );

  if (error) {
    console.error("Failed to update subscription:", error);
  }

  // Send confirmation email
  if (subscription.status === "active") {
    await sendSubscriptionEmail(userId, "activated");
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;

  // Deactivate subscription
  const { error } = await supabase
    .from("user_swing_subscriptions")
    .update({
      is_active: false,
      end_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to deactivate subscription:", error);
  }

  // Send cancellation email
  await sendSubscriptionEmail(userId, "canceled");
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  await handleSubscriptionUpdate(subscription);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.subscription_details?.metadata?.supabase_user_id;
  if (!userId) return;

  // Send payment failed email
  await sendSubscriptionEmail(userId, "payment_failed");
}

async function sendSubscriptionEmail(
  userId: string,
  type: "activated" | "canceled" | "payment_failed"
) {
  const { data: user } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!user) return;

  const emailTemplates = {
    activated: {
      subject: "Swing Analytics Add-on Activated",
      message: `Your Swing Analytics subscription is now active! Start tracking your swing data and achieving your golf goals.`,
    },
    canceled: {
      subject: "Swing Analytics Subscription Canceled",
      message: `Your Swing Analytics subscription has been canceled. Your data will be retained according to your tier's retention policy.`,
    },
    payment_failed: {
      subject: "Payment Failed - Action Required",
      message: `We couldn't process your payment for Swing Analytics. Please update your payment method to maintain access.`,
    },
  };

  const template = emailTemplates[type];

  try {
    await supabase.functions.invoke("send-email", {
      body: {
        to: user.email,
        subject: template.subject,
        html: `
          <h2>${template.subject}</h2>
          <p>Hi ${user.full_name || "there"},</p>
          <p>${template.message}</p>
          <p>Manage your subscription at: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile/settings">Account Settings</a></p>
          <p>Best regards,<br/>Prime Swing Fits Team</p>
        `,
      },
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}