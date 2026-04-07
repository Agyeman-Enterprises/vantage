import { ImapFlow } from "imapflow";

export interface ProbeResult {
  received: boolean;
  subject?: string;
  body?: string;
  delivery_ms?: number;
  error?: string;
}

/**
 * Watches a Mailcow probe mailbox via IMAP IDLE for up to `timeoutMs` ms.
 * Returns as soon as a new message matching `filter` arrives.
 */
export async function waitForEmail(opts: {
  host: string;
  port: number;
  user: string;
  password: string;
  timeoutMs: number;
  filter: (subject: string, text: string) => boolean;
  startedAt: number;
}): Promise<ProbeResult> {
  const client = new ImapFlow({
    host: opts.host,
    port: opts.port,
    secure: true,
    auth: { user: opts.user, pass: opts.password },
    logger: false,
  });

  return new Promise(async (resolve) => {
    const deadline = setTimeout(() => {
      client.close();
      resolve({ received: false, error: "timeout" });
    }, opts.timeoutMs);

    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");

      // Check messages already in inbox first (arrived before IDLE started)
      try {
        for await (const msg of client.fetch("1:*", { envelope: true, bodyStructure: true })) {
          const subject = msg.envelope?.subject ?? "";
          // Fetch text body
          const textParts: string[] = [];
          if (msg.bodyStructure) {
            try {
              const { content } = await client.download(msg.seq.toString(), "TEXT");
              const chunks: Buffer[] = [];
              for await (const chunk of content) chunks.push(chunk);
              textParts.push(Buffer.concat(chunks).toString("utf8"));
            } catch { /* no text part */ }
          }
          const text = textParts.join("\n");
          if (opts.filter(subject, text)) {
            clearTimeout(deadline);
            lock.release();
            await client.logout();
            resolve({
              received: true,
              subject,
              body: text.slice(0, 2000),
              delivery_ms: Date.now() - opts.startedAt,
            });
            return;
          }
        }
      } catch { /* empty inbox */ }

      // Listen for new arrivals via IDLE
      client.on("exists" as never, async () => {
        try {
          const latest = await client.fetchOne("*", { envelope: true, source: true });
          if (!latest) return;
          const subject = latest.envelope?.subject ?? "";
          const body = latest.source?.toString("utf8") ?? "";
          if (opts.filter(subject, body)) {
            clearTimeout(deadline);
            lock.release();
            // Delete the probe email to keep inbox clean
            await client.messageDelete("*");
            await client.logout();
            resolve({
              received: true,
              subject,
              body: body.slice(0, 2000),
              delivery_ms: Date.now() - opts.startedAt,
            });
          }
        } catch (e) {
          // ignore mid-IDLE fetch errors
        }
      });

      await client.idle();
    } catch (err) {
      clearTimeout(deadline);
      resolve({ received: false, error: String(err) });
    }
  });
}
