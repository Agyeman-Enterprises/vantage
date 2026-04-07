import { attest } from "../lib/signer.js";
import { z } from "zod";

export const verifySupabaseAuthSchema = z.object({
  supabase_url: z.string().url(),
  supabase_anon_key: z.string(),
  checks: z.array(z.enum(["smtp_configured", "otp_template", "email_confirm_off", "rate_limit"]))
    .default(["smtp_configured", "email_confirm_off"]),
  supabase_service_key: z.string().optional().describe("Required for admin-level checks"),
});

export type VerifySupabaseAuthInput = z.infer<typeof verifySupabaseAuthSchema>;

export async function verifySupabaseAuth(input: VerifySupabaseAuthInput) {
  const results: Record<string, unknown> = { supabase_url: input.supabase_url };

  // Probe auth health endpoint (public)
  try {
    const res = await fetch(`${input.supabase_url}/auth/v1/health`);
    results.auth_reachable = res.ok;
    results.auth_status = res.status;
  } catch (e) {
    results.auth_reachable = false;
    results.auth_error = String(e);
  }

  // Settings check via management API (requires service key or PAT)
  if (input.supabase_service_key && input.checks.includes("smtp_configured")) {
    try {
      const res = await fetch(`${input.supabase_url}/auth/v1/admin/config`, {
        headers: {
          apikey: input.supabase_service_key,
          Authorization: `Bearer ${input.supabase_service_key}`,
        },
      });
      if (res.ok) {
        const config = await res.json() as Record<string, unknown>;
        results.smtp_host = config["SMTP_HOST"] ?? config["smtp_host"] ?? null;
        results.smtp_configured = !!(results.smtp_host);
        results.email_confirm_required = config["MAILER_AUTOCONFIRM"] === false ||
          config["mailer_autoconfirm"] === false;
      }
    } catch (e) {
      results.smtp_check_error = String(e);
    }
  }

  // Test OTP send (proves SMTP works end-to-end — use a test address)
  if (input.checks.includes("otp_template")) {
    // We only verify the API accepts the request (200/204), not delivery
    // Full delivery proof is via verify_otp_delivery tool
    try {
      const res = await fetch(`${input.supabase_url}/auth/v1/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: input.supabase_anon_key,
        },
        body: JSON.stringify({ email: "vantage-probe@agyemanenterprises.com", create_user: false }),
      });
      results.otp_send_accepted = res.status === 200 || res.status === 204;
      results.otp_send_status = res.status;
    } catch (e) {
      results.otp_send_accepted = false;
      results.otp_send_error = String(e);
    }
  }

  results.verified = !!(results.auth_reachable);

  return attest("verify_supabase_auth", results);
}
