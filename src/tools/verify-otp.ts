import { z } from "zod";
import { waitForEmail } from "../lib/imap-probe.js";
import { attest } from "../lib/signer.js";

export const verifyOtpSchema = z.object({
  project_id: z.string().describe("Supabase project ID (e.g. czbjpyusckqjszjuhrko)"),
  trigger_email: z.string().email().describe("Email address to send the OTP to (must be the probe mailbox)"),
  supabase_url: z.string().url().describe("Full Supabase project URL"),
  supabase_anon_key: z.string().describe("Supabase anon key for the project"),
  timeout_ms: z.number().int().min(5000).max(120000).default(60000).describe("Max wait time in ms"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export async function verifyOtpDelivery(input: VerifyOtpInput) {
  const startedAt = Date.now();

  // Trigger OTP send via Supabase REST auth API
  const sendRes = await fetch(`${input.supabase_url}/auth/v1/otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: input.supabase_anon_key,
      Authorization: `Bearer ${input.supabase_anon_key}`,
    },
    body: JSON.stringify({ email: input.trigger_email, create_user: false }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.text();
    return attest("verify_otp_delivery", {
      verified: false,
      stage: "send",
      status: sendRes.status,
      error: err,
    });
  }

  // Wait for email to arrive in probe mailbox
  const probe = await waitForEmail({
    host: process.env.PROBE_IMAP_HOST!,
    port: parseInt(process.env.PROBE_IMAP_PORT ?? "993"),
    user: process.env.PROBE_IMAP_USER!,
    password: process.env.PROBE_IMAP_PASS!,
    timeoutMs: input.timeout_ms,
    startedAt,
    filter: (subject, body) => {
      // Look for 6-digit OTP code in subject or body
      return /\b\d{6}\b/.test(subject) || /\b\d{6}\b/.test(body);
    },
  });

  if (!probe.received) {
    return attest("verify_otp_delivery", {
      verified: false,
      stage: "receive",
      error: probe.error ?? "no email received within timeout",
    });
  }

  // Extract the 6-digit code
  const codeMatch = (probe.subject + " " + probe.body).match(/\b(\d{6})\b/);
  const code = codeMatch?.[1];

  // Verify no magic link leaked (security check)
  const hasMagicLink = /confirm|magic.link|token=/i.test(probe.body ?? "");

  return attest("verify_otp_delivery", {
    verified: true,
    code_received: true,
    code_length: code?.length ?? 0,
    magic_link_absent: !hasMagicLink,
    delivery_ms: probe.delivery_ms,
    subject: probe.subject,
  });
}
