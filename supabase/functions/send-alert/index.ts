// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record  = payload.record;
    if (!record || record.status !== "pending") return new Response("skipped", { status: 200 });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: student }    = await supabase.from("profiles").select("full_name, email").eq("id", record.student_id).single();
    const { data: educator }   = await supabase.from("profiles").select("full_name, email").eq("id", record.educator_id).single();
    const { data: prediction } = await supabase.from("predictions").select("predicted_score, shap_values").eq("id", record.prediction_id).single();

    if (!educator?.email) return new Response("no educator email", { status: 200 });

    const score      = Number(prediction?.predicted_score ?? 0).toFixed(1);
    const shapValues = prediction?.shap_values ?? {};
    const topFactors = Object.entries(shapValues)
      .sort((a, b) => Math.abs(b[1] as number) - Math.abs(a[1] as number))
      .slice(0, 3)
      .map(([k, v]) => {
        const val = v as number;
        return `${k.replace(/_/g, " ")}: ${val < 0 ? "↓ hurting" : "↑ helping"} (${val > 0 ? "+" : ""}${val.toFixed(2)})`;
      });

    const isCritical = record.risk_level === "critical";
    const emoji      = isCritical ? "🔴" : "🟠";
    const color      = isCritical ? "#EF4444" : "#F97316";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:'Segoe UI',sans-serif;background:#f8f9fa;margin:0;padding:0;}
.container{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
.header{background:${color};padding:28px 32px;}
.header h1{color:#fff;margin:0;font-size:20px;font-weight:700;}
.header p{color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;}
.body{padding:32px;}
.score-box{background:#f8f9fa;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;}
.score-box .score{font-size:48px;font-weight:800;color:${color};line-height:1;}
.score-box .label{color:#6b7280;font-size:13px;margin-top:4px;}
.student-row{display:flex;align-items:center;gap:12px;background:#f8f9fa;border-radius:8px;padding:14px 16px;margin-bottom:20px;}
.avatar{width:40px;height:40px;border-radius:10px;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4F46E5;font-size:18px;}
.section-title{font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;}
.factors li{font-size:14px;color:#374151;padding:4px 0;}
.cta{display:inline-block;margin-top:24px;background:#0F1117;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;}
.footer{background:#f8f9fa;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;}
</style></head><body>
<div class="container">
  <div class="header">
    <h1>${emoji} ${isCritical ? "CRITICAL — Immediate action needed" : "HIGH RISK — Review recommended"}</h1>
    <p>EduSense Early Warning System</p>
  </div>
  <div class="body">
    <p style="color:#374151;font-size:15px;">Hi ${educator.full_name},</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;">One of your students has been flagged as <strong style="color:${color}">${record.risk_level.toUpperCase()} RISK</strong>. Early intervention can significantly improve their outcome.</p>
    <div class="section-title">Student</div>
    <div class="student-row">
      <div class="avatar">${student?.full_name?.charAt(0) ?? "?"}</div>
      <div>
        <div style="font-weight:600;color:#111827">${student?.full_name ?? "Unknown"}</div>
        <div style="font-size:13px;color:#6b7280">${student?.email ?? ""}</div>
      </div>
    </div>
    <div class="score-box">
      <div class="score">${score}</div>
      <div class="label">Predicted Math Score / 100</div>
    </div>
    <div class="section-title">Top factors affecting this score</div>
    <ul class="factors">${topFactors.map(f => `<li>• ${f}</li>`).join("")}</ul>
    <a href="${Deno.env.get("FRONTEND_URL") ?? "https://edusense.app"}/educator" class="cta">View Full Report →</a>
  </div>
  <div class="footer">EduSense · Dismiss this alert in your dashboard to stop follow-up reminders.</div>
</div></body></html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}` },
      body: JSON.stringify({
        from: "EduSense <noreply@edusense.app>",
        to: educator.email,
        subject: `${emoji} [EduSense] ${record.risk_level.toUpperCase()} risk alert — ${student?.full_name}`,
        html,
      }),
    });

    await supabase.from("alerts").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", record.id);
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
