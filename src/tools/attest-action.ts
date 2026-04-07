import { z } from "zod";
import { attest } from "../lib/signer.js";
import { createHmac } from "node:crypto";

/**
 * attest_action — sign and record that an Aitonoma action was executed.
 *
 * No external I/O. Signs the provided payload with Vantage's Ed25519 key,
 * producing a verifiable attestation that an independent system (Vantage)
 * acknowledged the execution at a specific timestamp. Optionally POSTs the
 * bundle to Aitonoma's webhook for storage in the audit log.
 */
export const attestActionSchema = z.object({
  action_item_id: z.string().describe("Aitonoma action_item.id being attested"),
  action_type: z.string().describe("e.g. vercel_rollback, github_remediation"),
  workspace_id: z.string().describe("Aitonoma workspace_id"),
  outcome_summary: z.string().describe("Human-readable outcome from the executor"),
  status: z.enum(["done", "failed"]).describe("Final execution status"),

  // Optional callback to POST attestation back to Aitonoma
  callback_url: z.string().url().optional(),
  callback_secret: z.string().optional().describe("HMAC secret for X-Vantage-Signature header"),
});

export type AttestActionInput = z.infer<typeof attestActionSchema>;

export async function attestAction(input: AttestActionInput) {
  const bundle = attest("attest_action", {
    action_item_id: input.action_item_id,
    action_type: input.action_type,
    workspace_id: input.workspace_id,
    outcome_summary: input.outcome_summary,
    status: input.status,
    all_verified: input.status === "done",
  });

  if (input.callback_url) {
    try {
      const body = JSON.stringify(bundle);
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      if (input.callback_secret) {
        const sig = createHmac("sha256", input.callback_secret).update(body).digest("hex");
        headers["X-Vantage-Signature"] = `sha256=${sig}`;
      }

      await fetch(input.callback_url, { method: "POST", headers, body });
    } catch (e) {
      console.error("[vantage] attest_action callback failed", { url: input.callback_url, error: String(e) });
    }
  }

  return bundle;
}
