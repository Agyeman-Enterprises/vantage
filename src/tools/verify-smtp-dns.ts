import { promises as dns } from "node:dns";
import { attest } from "../lib/signer.js";
import { z } from "zod";

export const verifySmtpDnsSchema = z.object({
  domain: z.string().describe("Domain to check (e.g. telzyn.co)"),
  expected_mx: z.string().default("smtp.resend.com").describe("Expected MX host"),
  check_spf: z.boolean().default(true),
  check_dkim: z.boolean().default(true),
  dkim_selector: z.string().default("resend").describe("DKIM selector to check"),
});

export type VerifySmtpDnsInput = z.infer<typeof verifySmtpDnsSchema>;

export async function verifySmtpDns(input: VerifySmtpDnsInput) {
  const results: Record<string, unknown> = { domain: input.domain };

  // MX check
  try {
    const mx = await dns.resolveMx(input.domain);
    const found = mx.map((r) => r.exchange.toLowerCase());
    results.mx_records = found;
    results.mx_ok = found.some((h) => h.includes(input.expected_mx.toLowerCase()));
  } catch (e) {
    results.mx_ok = false;
    results.mx_error = String(e);
  }

  // SPF check
  if (input.check_spf) {
    try {
      const txt = await dns.resolveTxt(input.domain);
      const spf = txt.flat().find((r) => r.startsWith("v=spf1"));
      results.spf_record = spf ?? null;
      results.spf_ok = !!spf && spf.includes("include:amazonses.com") ||
        !!spf && spf.includes("include:_spf.mx.cloudflare.net") ||
        !!spf && spf.includes("resend");
    } catch (e) {
      results.spf_ok = false;
      results.spf_error = String(e);
    }
  }

  // DKIM check
  if (input.check_dkim) {
    const dkimHost = `${input.dkim_selector}._domainkey.${input.domain}`;
    try {
      const txt = await dns.resolveTxt(dkimHost);
      const dkim = txt.flat().join("");
      results.dkim_record = dkim.slice(0, 100) + (dkim.length > 100 ? "..." : "");
      results.dkim_ok = dkim.includes("v=DKIM1");
    } catch (e) {
      results.dkim_ok = false;
      results.dkim_error = String(e);
    }
  }

  results.verified = !!(results.mx_ok) &&
    (!input.check_spf || !!results.spf_ok) &&
    (!input.check_dkim || !!results.dkim_ok);

  return attest("verify_smtp_dns", results);
}
