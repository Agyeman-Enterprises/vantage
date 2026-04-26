import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { verifyOtpDelivery, verifyOtpSchema } from "./tools/verify-otp.js";
import { verifySmtpDns, verifySmtpDnsSchema } from "./tools/verify-smtp-dns.js";
import { verifySupabaseAuth, verifySupabaseAuthSchema } from "./tools/verify-supabase-auth.js";
import { verifyAgentTask, verifyAgentTaskSchema } from "./tools/verify-agent-task.js";
import { attestAction, attestActionSchema } from "./tools/attest-action.js";
import { publicKeyPem } from "./lib/signer.js";

const server = new McpServer({
  name: "vantage",
  version: "1.0.0",
});

server.tool(
  "verify_otp_delivery",
  "Sends an OTP email to the probe mailbox and verifies it arrives.",
  verifyOtpSchema.shape,
  async (input) => {
    const result = await verifyOtpDelivery(input as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "verify_smtp_dns",
  "Checks MX, SPF, and DKIM DNS records.",
  verifySmtpDnsSchema.shape,
  async (input) => {
    const result = await verifySmtpDns(input as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "verify_supabase_auth",
  "Probes a Supabase project's auth endpoint.",
  verifySupabaseAuthSchema.shape,
  async (input) => {
    const result = await verifySupabaseAuth(input as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "verify_agent_task",
  "Runs a bundle of outcome checks for a specific agent task.",
  verifyAgentTaskSchema.shape,
  async (input) => {
    const result = await verifyAgentTask(input as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "attest_action",
  "Signs an Aitonoma action execution with Vantage's Ed25519 key.",
  attestActionSchema.shape,
  async (input) => {
    const result = await attestAction(input as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_public_key",
  "Returns the Vantage Ed25519 public key PEM.",
  {},
  async () => {
    return { content: [{ type: "text", text: publicKeyPem() }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vantage MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
