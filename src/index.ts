import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { publicKeyPem } from "./lib/signer.js";
import { verifyOtpDelivery, verifyOtpSchema } from "./tools/verify-otp.js";
import { verifySmtpDns, verifySmtpDnsSchema } from "./tools/verify-smtp-dns.js";
import { verifySupabaseAuth, verifySupabaseAuthSchema } from "./tools/verify-supabase-auth.js";
import { verifyAgentTask, verifyAgentTaskSchema } from "./tools/verify-agent-task.js";
import { dashboardHtml } from "./dashboard.js";
import { landingHtml } from "./landing.js";

const PORT = parseInt(process.env.PORT ?? "3100");

const server = new McpServer({
  name: "vantage",
  version: "1.0.0",
});

// ── Tool: verify_otp_delivery ──────────────────────────────────────────────
server.tool(
  "verify_otp_delivery",
  "Sends an OTP email to the probe mailbox and verifies it arrives with a 6-digit code. Returns a signed attestation proving email delivery worked end-to-end.",
  verifyOtpSchema.shape,
  async (input) => {
    const result = await verifyOtpDelivery(input as Parameters<typeof verifyOtpDelivery>[0]);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: verify_smtp_dns ──────────────────────────────────────────────────
server.tool(
  "verify_smtp_dns",
  "Checks MX, SPF, and DKIM DNS records for a domain. Returns a signed attestation of DNS health.",
  verifySmtpDnsSchema.shape,
  async (input) => {
    const result = await verifySmtpDns(input as Parameters<typeof verifySmtpDns>[0]);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: verify_supabase_auth ─────────────────────────────────────────────
server.tool(
  "verify_supabase_auth",
  "Probes a Supabase project's auth endpoint and optionally checks SMTP config and OTP send acceptance. Returns a signed attestation.",
  verifySupabaseAuthSchema.shape,
  async (input) => {
    const result = await verifySupabaseAuth(input as Parameters<typeof verifySupabaseAuth>[0]);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: verify_agent_task (Aitonoma integration) ────────────────────────
server.tool(
  "verify_agent_task",
  "Aitonoma integration: runs a bundle of outcome checks for a specific agent task and returns a single signed attestation. Optionally POSTs the bundle back to an Aitonoma callback URL with HMAC signature.",
  verifyAgentTaskSchema.shape,
  async (input) => {
    const result = await verifyAgentTask(input as Parameters<typeof verifyAgentTask>[0]);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: get_public_key ───────────────────────────────────────────────────
server.tool(
  "get_public_key",
  "Returns the Vantage Ed25519 public key PEM. Use this to verify attestation signatures independently.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: publicKeyPem() }],
    };
  }
);

// ── HTTP server with Streamable HTTP MCP transport ─────────────────────────
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "vantage" }));
    return;
  }

  // Landing page
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(landingHtml());
    return;
  }

  // Dashboard
  if (req.url === "/dashboard" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(dashboardHtml(publicKeyPem()));
    return;
  }

  // REST endpoint for dashboard check button
  if (req.url === "/api/check" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const input = verifyAgentTaskSchema.parse(JSON.parse(body.toString()));
      const result = await verifyAgentTask(input);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (req.url === "/mcp") {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    res.on("close", () => { transport.close().catch(() => {}); });

    await server.connect(transport);
    await transport.handleRequest(req, res, await readBody(req));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

httpServer.listen(PORT, () => {
  console.log(`Vantage MCP server running on http://localhost:${PORT}/mcp`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
