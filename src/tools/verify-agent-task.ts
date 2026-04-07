import { z } from "zod";
import { attest, type Attestation } from "../lib/signer.js";
import { verifyOtpDelivery } from "./verify-otp.js";
import { verifySmtpDns } from "./verify-smtp-dns.js";
import { verifySupabaseAuth } from "./verify-supabase-auth.js";

/**
 * Task types Aitonoma agents can request verification for.
 * Extend this as new agent capabilities are added.
 */
const TASK_CHECKS = {
  email_delivery: "Verify OTP/email actually arrives in the target mailbox",
  smtp_dns: "Verify MX, SPF, DKIM DNS records are correctly configured",
  supabase_auth: "Verify Supabase auth endpoint is reachable and accepting OTPs",
} as const;

export const verifyAgentTaskSchema = z.object({
  task_id: z.string().describe("Aitonoma job/task ID — included in attestation for traceability"),
  agent_id: z.string().describe("Aitonoma agent identifier"),
  checks: z.array(z.enum(["email_delivery", "smtp_dns", "supabase_auth"]))
    .min(1)
    .describe("Which outcome checks to run"),

  // Params for email_delivery check
  supabase_url: z.string().url().optional(),
  supabase_anon_key: z.string().optional(),
  probe_email: z.string().email().default("vantage-probe@agyemanenterprises.com"),
  otp_timeout_ms: z.number().int().default(60000),

  // Params for smtp_dns check
  domain: z.string().optional(),

  // Aitonoma webhook to POST attestation bundle back to
  callback_url: z.string().url().optional().describe("Aitonoma endpoint to receive the attestation bundle"),
  callback_secret: z.string().optional().describe("HMAC secret for signing the callback POST"),
});

export type VerifyAgentTaskInput = z.infer<typeof verifyAgentTaskSchema>;

export async function verifyAgentTask(input: VerifyAgentTaskInput) {
  const attestations: Attestation[] = [];
  const errors: string[] = [];

  // Run requested checks in parallel where possible
  const pending: Promise<void>[] = [];

  if (input.checks.includes("smtp_dns")) {
    if (!input.domain) {
      errors.push("smtp_dns check requires domain parameter");
    } else {
      pending.push(
        verifySmtpDns({ domain: input.domain, expected_mx: "smtp.resend.com", check_spf: true, check_dkim: true, dkim_selector: "resend" })
          .then((a) => { attestations.push(a); })
          .catch((e) => { errors.push(`smtp_dns: ${e}`); })
      );
    }
  }

  if (input.checks.includes("supabase_auth")) {
    if (!input.supabase_url || !input.supabase_anon_key) {
      errors.push("supabase_auth check requires supabase_url and supabase_anon_key");
    } else {
      pending.push(
        verifySupabaseAuth({
          supabase_url: input.supabase_url,
          supabase_anon_key: input.supabase_anon_key,
          checks: ["otp_template"],
        })
          .then((a) => { attestations.push(a); })
          .catch((e) => { errors.push(`supabase_auth: ${e}`); })
      );
    }
  }

  // Run parallel checks first
  await Promise.all(pending);

  // email_delivery runs after supabase_auth (sequential — needs SMTP ready)
  if (input.checks.includes("email_delivery")) {
    if (!input.supabase_url || !input.supabase_anon_key) {
      errors.push("email_delivery check requires supabase_url and supabase_anon_key");
    } else {
      try {
        const a = await verifyOtpDelivery({
          project_id: new URL(input.supabase_url).hostname.split(".")[0],
          trigger_email: input.probe_email,
          supabase_url: input.supabase_url,
          supabase_anon_key: input.supabase_anon_key,
          timeout_ms: input.otp_timeout_ms,
        });
        attestations.push(a);
      } catch (e) {
        errors.push(`email_delivery: ${e}`);
      }
    }
  }

  // Build the attestation bundle
  const allVerified = attestations.every((a) => a.result["verified"] === true) && errors.length === 0;

  const bundle = attest("verify_agent_task", {
    task_id: input.task_id,
    agent_id: input.agent_id,
    checks_requested: input.checks,
    checks_run: attestations.map((a) => a.tool),
    all_verified: allVerified,
    errors,
    attestations,
  });

  // POST bundle back to Aitonoma if callback provided
  if (input.callback_url) {
    try {
      const body = JSON.stringify(bundle);
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      if (input.callback_secret) {
        const { createHmac } = await import("node:crypto");
        const sig = createHmac("sha256", input.callback_secret).update(body).digest("hex");
        headers["X-Vantage-Signature"] = `sha256=${sig}`;
      }

      await fetch(input.callback_url, { method: "POST", headers, body });
    } catch (e) {
      // Callback failure doesn't affect the attestation — log only
      console.error("[vantage] callback failed", { url: input.callback_url, error: String(e) });
    }
  }

  return bundle;
}
