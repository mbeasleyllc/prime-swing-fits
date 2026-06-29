import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with active swing analytics
    const { data: subscriptions, error: subError } = await supabase
      .from("user_swing_subscriptions")
      .select("user_id, tier, data_retention_months")
      .eq("is_active", true);

    if (subError) throw subError;

    const results: any[] = [];

    for (const sub of subscriptions || []) {
      // Skip premium_plus (unlimited retention)
      if (sub.tier === "premium_plus" || !sub.data_retention_months) {
        continue;
      }

      const retentionMonths = sub.data_retention_months;
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

      // Find sessions older than cutoff
      const { data: oldSessions } = await supabase
        .from("swing_sessions")
        .select("id, session_date")
        .eq("user_id", sub.user_id)
        .lt("session_date", cutoffDate.toISOString().split("T")[0]);

      if (!oldSessions || oldSessions.length === 0) {
        continue;
      }

      // Check if user was warned 7 days ago
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() - 7);

      const { data: recentWarning } = await supabase
        .from("email_logs")
        .select("id")
        .eq("user_id", sub.user_id)
        .eq("email_type", "data_retention_warning")
        .gte("sent_at", warningDate.toISOString())
        .limit(1);

      // If no recent warning, send one and skip deletion
      if (!recentWarning || recentWarning.length === 0) {
        await sendWarningEmail(supabase, sub.user_id, oldSessions.length);
        results.push({
          user_id: sub.user_id,
          action: "warning_sent",
          sessions: oldSessions.length,
        });
        continue;
      }

      // Warning was sent, proceed with deletion
      const sessionIds = oldSessions.map((s) => s.id);

      // Delete metrics first (foreign key cascade should handle this, but explicit is safer)
      await supabase
        .from("swing_metrics")
        .delete()
        .in("session_id", sessionIds);

      // Delete sessions
      const { error: deleteError } = await supabase
        .from("swing_sessions")
        .delete()
        .in("id", sessionIds);

      if (deleteError) throw deleteError;

      // Send deletion confirmation
      await sendDeletionEmail(
        supabase,
        sub.user_id,
        oldSessions.length,
        retentionMonths
      );

      results.push({
        user_id: sub.user_id,
        action: "deleted",
        sessions: oldSessions.length,
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Data retention cleanup error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function sendWarningEmail(
  supabase: any,
  userId: string,
  sessionCount: number
) {
  const { data: user } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!user) return;

  await supabase.functions.invoke("send-email", {
    body: {
      to: user.email,
      subject: "Action Required: Swing Data Will Be Deleted in 7 Days",
      html: `
        <h2>Data Retention Notice</h2>
        <p>Hi ${user.full_name || "there"},</p>
        <p><strong>${sessionCount} swing sessions</strong> will be automatically deleted in 7 days due to your tier's data retention policy.</p>
        <p><strong>Action Required:</strong></p>
        <ul>
          <li><a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/swing-analytics/export">Export your data</a> before deletion</li>
          <li><a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/pricing">Upgrade to Premium</a> for longer retention (12 months)</li>
          <li><a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/pricing">Upgrade to Premium Plus</a> for unlimited retention</li>
        </ul>
        <p>Questions? Contact us at support@primeswingfits.com</p>
        <p>Best regards,<br/>Prime Swing Fits Team</p>
      `,
    },
  });

  // Log the warning
  await supabase.from("email_logs").insert({
    user_id: userId,
    email_type: "data_retention_warning",
    recipient_email: user.email,
    subject: "Data Retention Warning",
    status: "sent",
  });
}

async function sendDeletionEmail(
  supabase: any,
  userId: string,
  sessionCount: number,
  retentionMonths: number
) {
  const { data: user } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!user) return;

  await supabase.functions.invoke("send-email", {
    body: {
      to: user.email,
      subject: `${sessionCount} Swing Sessions Deleted - Data Retention Policy`,
      html: `
        <h2>Data Retention Policy Applied</h2>
        <p>Hi ${user.full_name || "there"},</p>
        <p><strong>${sessionCount} swing sessions</strong> older than ${retentionMonths} months have been deleted according to your tier's retention policy.</p>
        <p>Your recent data remains safe and accessible.</p>
        <p>To keep your data longer:</p>
        <ul>
          <li><a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/pricing">Upgrade to Premium</a> - 12-month retention</li>
          <li><a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/pricing">Upgrade to Premium Plus</a> - Unlimited retention</li>
        </ul>
        <p>Best regards,<br/>Prime Swing Fits Team</p>
      `,
    },
  });

  // Log the deletion
  await supabase.from("email_logs").insert({
    user_id: userId,
    email_type: "data_retention_deletion",
    recipient_email: user.email,
    subject: "Data Deleted",
    status: "sent",
  });
}