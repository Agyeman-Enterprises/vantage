// Static HTML dashboard served at GET /
export function dashboardHtml(publicKey: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vantage — Outcome Verification</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080c14; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; min-height: 100vh; }
    header { border-bottom: 1px solid #1e293b; padding: 18px 32px; display: flex; align-items: center; gap: 14px; }
    .logo { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; }
    header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
    header span { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; margin-left: 2px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-left: auto; box-shadow: 0 0 6px #22c55e88; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

    main { max-width: 1100px; margin: 0 auto; padding: 32px; }

    .section-title { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }

    /* Run checks panel */
    .panel { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .panel h2 { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #94a3b8; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    input, select { background: #080c14; border: 1px solid #1e293b; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; outline: none; transition: border-color .15s; }
    input:focus, select:focus { border-color: #6366f1; }
    input::placeholder { color: #334155; }
    .checks-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .check-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid #1e293b; border-radius: 20px; font-size: 12px; cursor: pointer; user-select: none; color: #64748b; transition: all .15s; }
    .check-pill input[type=checkbox] { display: none; }
    .check-pill.active { border-color: #6366f1; color: #a5b4fc; background: #6366f114; }

    .run-btn { margin-top: 16px; width: 100%; padding: 11px; border-radius: 8px; border: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
    .run-btn:hover { opacity: .9; }
    .run-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* Results */
    #results { display: none; }
    .result-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge.pass { background: #22c55e18; color: #22c55e; border: 1px solid #22c55e30; }
    .badge.fail { background: #ef444418; color: #ef4444; border: 1px solid #ef444430; }
    .delivery-ms { font-size: 13px; color: #64748b; }
    pre { background: #080c14; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; font-size: 12px; line-height: 1.6; overflow-x: auto; color: #94a3b8; max-height: 400px; overflow-y: auto; }

    /* MCP connection */
    .connect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .connect-card { background: #080c14; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; }
    .connect-card h3 { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #94a3b8; }
    .connect-card p { font-size: 12px; color: #475569; margin-bottom: 10px; line-height: 1.5; }
    .copy-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 6px; border: 1px solid #1e293b; background: transparent; color: #6366f1; font-size: 12px; cursor: pointer; transition: all .15s; }
    .copy-btn:hover { border-color: #6366f1; background: #6366f114; }
    code { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; }
    .code-block { background: #080c14; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; overflow-x: auto; white-space: pre; font-size: 11px; color: #94a3b8; line-height: 1.5; }
  </style>
</head>
<body>
<header>
  <div class="logo">V</div>
  <div>
    <h1>Vantage</h1>
    <span>Outcome Verification Oracle</span>
  </div>
  <div class="status-dot" title="Server running"></div>
</header>

<main>
  <!-- Run a check -->
  <div class="panel">
    <div class="section-title">Run Verification</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Supabase URL</label>
        <input id="sb-url" type="url" placeholder="https://xxxx.supabase.co" />
      </div>
      <div class="form-group">
        <label>Anon Key</label>
        <input id="sb-key" type="text" placeholder="eyJh..." />
      </div>
      <div class="form-group">
        <label>Domain (for DNS check)</label>
        <input id="domain" type="text" placeholder="telzyn.co" />
      </div>
      <div class="form-group">
        <label>Task / Label</label>
        <input id="task-id" type="text" placeholder="my-project-setup" value="manual-check" />
      </div>
      <div class="form-group full">
        <label>Checks to run</label>
        <div class="checks-row">
          <label class="check-pill active" onclick="toggleCheck(this,'smtp_dns')">
            <input type="checkbox" checked> DNS (MX/SPF/DKIM)
          </label>
          <label class="check-pill active" onclick="toggleCheck(this,'supabase_auth')">
            <input type="checkbox" checked> Supabase Auth
          </label>
          <label class="check-pill" onclick="toggleCheck(this,'email_delivery')">
            <input type="checkbox"> Email Delivery (IMAP)
          </label>
        </div>
      </div>
    </div>
    <button class="run-btn" id="run-btn" onclick="runCheck()">Run Verification</button>
  </div>

  <!-- Results -->
  <div class="panel" id="results">
    <div class="section-title">Result</div>
    <div class="result-header">
      <span id="result-badge" class="badge"></span>
      <span id="delivery-info" class="delivery-ms"></span>
    </div>
    <pre id="result-json"></pre>
  </div>

  <!-- MCP Connection -->
  <div class="panel">
    <div class="section-title">Connect as MCP Server</div>
    <div class="connect-grid">
      <div class="connect-card">
        <h3>Claude Code (claude_desktop_config.json)</h3>
        <p>Add Vantage as an MCP server so Claude can call verification tools directly.</p>
        <div class="code-block" id="cc-config">{
  "mcpServers": {
    "vantage": {
      "url": "http://localhost:3100/mcp",
      "type": "streamable-http"
    }
  }
}</div>
        <button class="copy-btn" onclick="copy('cc-config')">Copy config</button>
      </div>
      <div class="connect-card">
        <h3>Aitonoma agent call</h3>
        <p>Call verify_agent_task from any Aitonoma agent to get a signed attestation bundle.</p>
        <div class="code-block" id="aitonoma-call">{
  "tool": "verify_agent_task",
  "input": {
    "task_id": "job-123",
    "agent_id": "aitonoma-agent-1",
    "checks": ["smtp_dns", "supabase_auth"],
    "domain": "your-domain.com",
    "supabase_url": "https://xxxx.supabase.co",
    "supabase_anon_key": "eyJh...",
    "callback_url": "https://aitonoma.ai/api/vantage/callback"
  }
}</div>
        <button class="copy-btn" onclick="copy('aitonoma-call')">Copy</button>
      </div>
    </div>
  </div>

  <!-- Public key -->
  <div class="panel">
    <div class="section-title">Attestation Public Key</div>
    <p style="font-size:12px;color:#475569;margin-bottom:10px">Use this Ed25519 key to independently verify any attestation signature returned by Vantage.</p>
    <pre style="font-size:11px">${publicKey.trim()}</pre>
  </div>
</main>

<script>
  let activeChecks = new Set(['smtp_dns', 'supabase_auth']);

  function toggleCheck(el, name) {
    if (activeChecks.has(name)) { activeChecks.delete(name); el.classList.remove('active'); }
    else { activeChecks.add(name); el.classList.add('active'); }
  }

  async function runCheck() {
    const btn = document.getElementById('run-btn');
    btn.disabled = true;
    btn.textContent = 'Running…';

    const checks = [...activeChecks];
    const body = {
      task_id: document.getElementById('task-id').value || 'manual-check',
      agent_id: 'dashboard',
      checks,
      supabase_url: document.getElementById('sb-url').value || undefined,
      supabase_anon_key: document.getElementById('sb-key').value || undefined,
      domain: document.getElementById('domain').value || undefined,
      otp_timeout_ms: 60000,
    };

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const resultsEl = document.getElementById('results');
      resultsEl.style.display = 'block';

      const badge = document.getElementById('result-badge');
      const allVerified = data.result?.all_verified ?? data.result?.verified;
      badge.className = 'badge ' + (allVerified ? 'pass' : 'fail');
      badge.textContent = allVerified ? '✓ Verified' : '✗ Failed';

      const ms = data.result?.attestations?.find(a => a.result?.delivery_ms)?.result?.delivery_ms;
      document.getElementById('delivery-info').textContent = ms ? 'Delivered in ' + ms + 'ms' : '';

      document.getElementById('result-json').textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Run Verification';
    }
  }

  function copy(id) {
    navigator.clipboard.writeText(document.getElementById(id).textContent);
  }
</script>
</body>
</html>`;
}
