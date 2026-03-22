// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: educators } = await supabase.from("profiles").select("id, full_name, email").eq("role", "educator");
  if (!educators?.length) return new Response("no educators", { status: 200 });

  let sent = 0;

  for (const educator of educators) {
    const { data: classes } = await supabase.from("classes").select("id, name").eq("educator_id", educator.id);
    if (!classes?.length) continue;

    const classIds = classes.map(c => c.id);
    const { data: students } = await supabase.from("profiles").select("id, full_name").in("class_id", classIds).eq("role", "student");
    if (!students?.length) continue;

    const studentIds = students.map(s => s.id);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: predictions } = await supabase.from("predictions")
      .select("student_id, predicted_score, risk_level, created_at")
      .in("student_id", studentIds).gte("created_at", weekAgo).order("created_at", { ascending: false });

    const { data: alerts } = await supabase.from("alerts")
      .select("id, student_id, risk_level, message").in("student_id", studentIds).eq("status", "pending");

    const studentMap: Record<string, string> = Object.fromEntries(students.map(s => [s.id, s.full_name]));
    const latestByStudent: Record<string, any> = {};
    for (const p of predictions ?? []) {
      if (!latestByStudent[p.student_id]) latestByStudent[p.student_id] = p;
    }

    const atRisk = Object.values(latestByStudent).filter(p => ["high","critical"].includes(p.risk_level));
    const avgScore = predictions?.length
      ? (predictions.reduce((s, p) => s + Number(p.predicted_score), 0) / predictions.length).toFixed(1) : "—";

    const riskRows = atRisk.map(p => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827">${studentMap[p.student_id] ?? "Unknown"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:${p.risk_level === "critical" ? "#EF4444" : "#F97316"}">${Number(p.predicted_score).toFixed(1)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:${p.risk_level === "critical" ? "#EF4444" : "#F97316"};text-transform:uppercase;font-weight:600">${p.risk_level}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:'Segoe UI',sans-serif;background:#f8f9fa;margin:0;padding:0;}
.container{max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
.header{background:#0F1117;padding:28px 32px;}
.header h1{color:#fff;margin:0;font-size:20px;font-weight:700;}
.header p{color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:13px;}
.body{padding:32px;}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px;}
.stat{background:#f8f9fa;border-radius:10px;padding:16px;text-align:center;}
.stat .val{font-size:28px;font-weight:800;color:#111827;}
.stat .lbl{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-top:4px;}
.section-title{font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:24px 0 12px;}
table{width:100%;border-collapse:collapse;}
th{text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;padding:8px 12px;border-bottom:2px solid #f3f4f6;}
.cta{display:inline-block;margin-top:24px;background:#4F8EF7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;}
.footer{background:#f8f9fa;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;}
</style></head><body>
<div class="container">
  <div class="header">
    <h1>📊 Weekly Performance Digest</h1>
    <p>EduSense · Week of ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
  </div>
  <div class="body">
    <p style="color:#374151;font-size:15px;">Hi ${educator.full_name},</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;">Here's your weekly summary for <strong>${classes.map(c => c.name).join(", ")}</strong>.</p>
    <div class="stats">
      <div class="stat"><div class="val">${students.length}</div><div class="lbl">Total Students</div></div>
      <div class="stat"><div class="val" style="color:${atRisk.length > 0 ? "#EF4444" : "#22C55E"}">${atRisk.length}</div><div class="lbl">At Risk</div></div>
      <div class="stat"><div class="val">${avgScore}</div><div class="lbl">Avg Score</div></div>
    </div>
    ${atRisk.length > 0
      ? `<div class="section-title">Students needing attention</div>
         <table><thead><tr><th>Student</th><th>Predicted Score</th><th>Risk</th></tr></thead><tbody>${riskRows}</tbody></table>`
      : `<div style="background:#f0fdf4;border-radius:10px;padding:20px;text-align:center;color:#16a34a;font-weight:600;">✅ No at-risk students this week. Great work!</div>`}
    ${(alerts?.length ?? 0) > 0
      ? `<div class="section-title">${alerts!.length} pending alert${alerts!.length > 1 ? "s" : ""} awaiting review</div>
         <p style="font-size:14px;color:#6b7280;">Log in to dismiss them.</p>` : ""}
    <a href="${Deno.env.get("FRONTEND_URL") ?? "https://edusense.app"}/educator" class="cta">Open Dashboard →</a>
  </div>
  <div class="footer">EduSense · Sent every Monday</div>
</div></body></html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}` },
      body: JSON.stringify({
        from: "EduSense <noreply@edusense.app>",
        to: educator.email,
        subject: `📊 Weekly digest — ${atRisk.length} student${atRisk.length !== 1 ? "s" : ""} need your attention`,
        html,
      }),
    });
    sent++;
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
