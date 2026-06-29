import { supabase } from "@/integrations/supabase/client";

interface GoalReminderData {
  userId: string;
  goalName: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  daysRemaining: number;
  userEmail: string;
}

export async function sendGoalReminder(data: GoalReminderData, milestone: 50 | 75 | 90): Promise<void> {
  const subject = `Goal Progress Update: ${data.goalName} - ${milestone}% Timeline`;
  
  const bodyText = `
Hi there,

You're ${milestone}% of the way to your goal deadline for "${data.goalName}"!

Current Progress:
- Target: ${data.targetValue} ${data.metricName.replace("_", " ")}
- Current: ${data.currentValue}
- Progress: ${data.progressPercent.toFixed(1)}%
- Days Remaining: ${data.daysRemaining}

${milestone === 50 ? "You're halfway there! Stay consistent with your practice sessions." : ""}
${milestone === 75 ? "You're in the home stretch! Keep up the great work." : ""}
${milestone === 90 ? "Final push! Only a few days left to reach your goal." : ""}

View your progress: ${process.env.NEXT_PUBLIC_SITE_URL || "https://primeswingfits.com"}/profile

Keep swinging,
Prime Swing Fits
  `.trim();

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A0A0A; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .progress-bar { background: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
    .progress-fill { background: linear-gradient(90deg, #22C55E, #16A34A); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat { background: white; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-label { color: #666; font-size: 14px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #0A0A0A; }
    .cta { background: #22C55E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Goal Progress Update</h1>
      <p>${milestone}% to Deadline</p>
    </div>
    <div class="content">
      <h2>${data.goalName}</h2>
      
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${data.progressPercent}%">
          ${data.progressPercent.toFixed(1)}%
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-label">Current</div>
          <div class="stat-value">${data.currentValue}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Target</div>
          <div class="stat-value">${data.targetValue}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Days Left</div>
          <div class="stat-value">${data.daysRemaining}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Metric</div>
          <div class="stat-value" style="font-size: 16px;">${data.metricName.replace("_", " ")}</div>
        </div>
      </div>

      <p>
        ${milestone === 50 ? "You're halfway to your deadline! Stay consistent with your practice sessions to reach your goal." : ""}
        ${milestone === 75 ? "You're in the home stretch! Keep up the great work and maintain your practice routine." : ""}
        ${milestone === 90 ? "Final push! Only a few days left to reach your goal. You've got this!" : ""}
      </p>

      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://primeswingfits.com"}/profile" class="cta">
        View Your Progress
      </a>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: data.userEmail,
        subject,
        text: bodyText,
        html: bodyHtml,
      },
    });

    if (error) {
      console.error("Error sending goal reminder:", error);
    }
  } catch (error) {
    console.error("Error invoking send-email function:", error);
  }
}

export async function checkAndSendGoalReminders(): Promise<void> {
  try {
    const { data: goals } = await supabase
      .from("swing_goals")
      .select(`
        id,
        user_id,
        goal_name,
        metric_name,
        target_value,
        current_value,
        progress_percent,
        target_date,
        last_reminder_sent,
        users!inner(email)
      `)
      .eq("status", "active");

    if (!goals) return;

    const now = new Date();

    for (const goal of goals) {
      const targetDate = new Date(goal.target_date);
      const totalDays = Math.ceil((targetDate.getTime() - new Date(goal.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((now.getTime() - new Date(goal.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
      const timelinePercent = (daysElapsed / totalDays) * 100;

      const milestones = [50, 75, 90];
      const lastReminderSent = goal.last_reminder_sent ? new Date(goal.last_reminder_sent).getTime() : 0;
      const hoursSinceLastReminder = (now.getTime() - lastReminderSent) / (1000 * 60 * 60);

      for (const milestone of milestones) {
        if (timelinePercent >= milestone && timelinePercent < milestone + 5 && hoursSinceLastReminder > 24) {
          const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          await sendGoalReminder(
            {
              userId: goal.user_id,
              goalName: goal.goal_name,
              metricName: goal.metric_name,
              targetValue: goal.target_value,
              currentValue: goal.current_value,
              progressPercent: goal.progress_percent,
              daysRemaining,
              userEmail: (goal.users as any).email,
            },
            milestone as 50 | 75 | 90
          );

          await supabase
            .from("swing_goals")
            .update({ last_reminder_sent: now.toISOString() })
            .eq("id", goal.id);

          break;
        }
      }
    }
  } catch (error) {
    console.error("Error checking goal reminders:", error);
  }
}