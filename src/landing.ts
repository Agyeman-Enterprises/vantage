export function landingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vantage — Every Agent Action, Proven</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #06080f;
      --surface: #0d1117;
      --border: #1a2030;
      --accent: #6366f1;
      --accent2: #8b5cf6;
      --green: #22c55e;
      --dim: #64748b;
      --mid: #94a3b8;
      --white: #f1f5f9;
    }
    body {
      background: var(--bg);
      color: var(--white);
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* Nav */
    nav {
      border-bottom: 1px solid var(--border);
      padding: 0 48px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      background: rgba(6,8,15,0.92);
      backdrop-filter: blur(12px);
      z-index: 10;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; }
    .logo-mark {
      width: 28px; height: 28px; border-radius: 7px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; color: #fff;
    }
    .nav-name { font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
    .nav-cta {
      background: var(--accent); color: #fff; border: none;
      padding: 8px 18px; border-radius: 6px; font-size: 12px;
      font-weight: 600; cursor: pointer; text-decoration: none;
      letter-spacing: 0.02em;
    }
    .nav-cta:hover { background: var(--accent2); }

    /* Hero */
    .hero {
      max-width: 860px; margin: 0 auto;
      padding: 100px 48px 80px;
      text-align: center;
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
      border-radius: 20px; padding: 5px 14px;
      font-size: 11px; font-weight: 600; color: #a5b4fc;
      letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px;
    }
    .pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--green);
             box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
    h1 {
      font-size: clamp(32px, 5.5vw, 56px); font-weight: 800;
      line-height: 1.1; letter-spacing: -1px; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub {
      font-size: 17px; color: var(--mid); line-height: 1.7;
      max-width: 560px; margin: 0 auto 44px;
    }
    .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #fff; padding: 13px 28px; border-radius: 8px;
      font-size: 14px; font-weight: 600; text-decoration: none;
      display: inline-block; box-shadow: 0 0 32px rgba(99,102,241,0.3);
    }
    .btn-ghost {
      border: 1px solid var(--border); color: var(--mid);
      padding: 13px 28px; border-radius: 8px; font-size: 14px;
      text-decoration: none; display: inline-block;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--white); }

    /* Proof bar */
    .proof-bar {
      max-width: 800px; margin: 0 auto 80px;
      padding: 0 48px;
      display: flex; justify-content: center;
      gap: 40px; flex-wrap: wrap;
    }
    .proof-item { text-align: center; }
    .proof-num { font-size: 28px; font-weight: 800; color: var(--accent); letter-spacing: -1px; }
    .proof-label { font-size: 11px; color: var(--dim); text-transform: uppercase;
                   letter-spacing: 0.1em; margin-top: 4px; }

    /* How it works */
    .section { max-width: 900px; margin: 0 auto; padding: 0 48px 80px; }
    .section-label {
      font-size: 11px; font-weight: 600; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 14px;
    }
    .section-title { font-size: clamp(22px, 3vw, 32px); font-weight: 700;
                     letter-spacing: -0.5px; margin-bottom: 12px; }
    .section-body { font-size: 15px; color: var(--mid); line-height: 1.7; max-width: 520px; }

    /* Steps */
    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
             gap: 1px; background: var(--border); border: 1px solid var(--border);
             border-radius: 12px; overflow: hidden; margin-top: 40px; }
    .step { background: var(--surface); padding: 28px 24px; }
    .step-num { font-size: 10px; font-weight: 700; color: var(--accent);
                text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; }
    .step-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .step-body { font-size: 13px; color: var(--dim); line-height: 1.6; }

    /* Aitonoma callout */
    .callout {
      max-width: 900px; margin: 0 auto 80px; padding: 0 48px;
    }
    .callout-inner {
      background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06));
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px; padding: 48px;
      display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center;
    }
    .callout-badge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 10px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 14px;
    }
    .partner-dot { width: 20px; height: 20px; border-radius: 5px;
      background: linear-gradient(135deg, #00ff88, #00b4d8);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 900; color: #000; }
    .callout h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 12px; }
    .callout p { font-size: 14px; color: var(--mid); line-height: 1.7; max-width: 480px; }
    .attestation-badge {
      background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
      border-radius: 10px; padding: 20px 24px; text-align: center; min-width: 160px;
    }
    .att-check { font-size: 28px; margin-bottom: 6px; }
    .att-label { font-size: 11px; font-weight: 700; color: var(--green);
                 text-transform: uppercase; letter-spacing: 0.1em; }
    .att-sub { font-size: 10px; color: var(--dim); margin-top: 4px; }

    /* Features */
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px; margin-top: 40px; }
    .feat {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 24px;
    }
    .feat-icon { font-size: 20px; margin-bottom: 12px; }
    .feat-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .feat-body { font-size: 12px; color: var(--dim); line-height: 1.6; }

    /* CTA bottom */
    .cta-bottom {
      max-width: 900px; margin: 0 auto 80px; padding: 0 48px; text-align: center;
    }
    .cta-inner {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 56px 40px;
    }
    .cta-inner h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.4px; margin-bottom: 12px; }
    .cta-inner p { font-size: 15px; color: var(--mid); margin-bottom: 32px; }

    footer {
      border-top: 1px solid var(--border); padding: 24px 48px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; color: var(--dim);
    }
    footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>

<nav>
  <div class="nav-logo">
    <div class="logo-mark">V</div>
    <span class="nav-name">Vantage</span>
  </div>
  <a href="/dashboard" class="nav-cta">Open Dashboard</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="eyebrow">
    <div class="pulse"></div>
    Outcome Verification Oracle
  </div>
  <h1>Your agents act.<br><em>Vantage proves</em> it worked.</h1>
  <p class="hero-sub">
    Every task your AI agents complete is cryptographically verified — not logged, not guessed.
    Signed attestations you can audit, share, and trust.
  </p>
  <div class="hero-ctas">
    <a href="/dashboard" class="btn-primary">Open Dashboard</a>
    <a href="https://aitonoma.agyemanenterprises.com" class="btn-ghost">See Aitonoma →</a>
  </div>
</section>

<!-- Proof bar -->
<div class="proof-bar">
  <div class="proof-item">
    <div class="proof-num">Ed25519</div>
    <div class="proof-label">Signed attestations</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">&lt;60s</div>
    <div class="proof-label">End-to-end verify</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">5</div>
    <div class="proof-label">Verification tools</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">MCP</div>
    <div class="proof-label">Native agent protocol</div>
  </div>
</div>

<!-- How it works -->
<div class="section">
  <div class="section-label">How it works</div>
  <div class="section-title">Proof, not promises.</div>
  <p class="section-body">
    Most platforms tell you an agent ran. Vantage tells you the outcome was correct —
    with a signature any system can independently verify.
  </p>
  <div class="steps">
    <div class="step">
      <div class="step-num">01 — Act</div>
      <div class="step-title">Agent completes a task</div>
      <div class="step-body">Your Aitonoma agent sets up auth, configures email, deploys an app — whatever the job is.</div>
    </div>
    <div class="step">
      <div class="step-num">02 — Verify</div>
      <div class="step-title">Vantage probes the outcome</div>
      <div class="step-body">Vantage checks DNS records, receives the actual OTP email, pings the live endpoint. Real signals, not assumptions.</div>
    </div>
    <div class="step">
      <div class="step-num">03 — Attest</div>
      <div class="step-title">Signed proof is issued</div>
      <div class="step-body">An Ed25519-signed attestation bundle is returned — timestamp, checks run, results, signature. Tamper-evident by design.</div>
    </div>
    <div class="step">
      <div class="step-num">04 — Trust</div>
      <div class="step-title">You sleep at night</div>
      <div class="step-body">Your dashboard shows verified ✓ next to every completed job. Your audit log is a chain of proof, not a list of claims.</div>
    </div>
  </div>
</div>

<!-- Aitonoma callout -->
<div class="callout">
  <div class="callout-inner">
    <div>
      <div class="callout-badge">
        <div class="partner-dot">A</div>
        Built for Aitonoma
      </div>
      <h2>The trust layer your autonomous agents need.</h2>
      <p>
        Aitonoma runs your business operations autonomously. Vantage is the verification
        engine underneath — ensuring every action Aitonoma takes produced a provably correct
        result. When a client asks "did it actually work?", the answer is a signed attestation,
        not a log entry.
      </p>
    </div>
    <div class="attestation-badge">
      <div class="att-check">✓</div>
      <div class="att-label">Verified</div>
      <div class="att-sub">Signed by Vantage</div>
    </div>
  </div>
</div>

<!-- Features -->
<div class="section">
  <div class="section-label">What Vantage verifies</div>
  <div class="section-title">No blind spots.</div>
  <div class="features">
    <div class="feat">
      <div class="feat-icon">📬</div>
      <div class="feat-title">Email delivery</div>
      <div class="feat-body">Watches the probe mailbox via IMAP IDLE. Proves the OTP actually arrived — not just that the API call returned 200.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🌐</div>
      <div class="feat-title">DNS configuration</div>
      <div class="feat-body">Verifies MX, SPF, and DKIM records resolve correctly. Catches the silent misconfigurations that break email weeks later.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🔐</div>
      <div class="feat-title">Auth endpoints</div>
      <div class="feat-body">Probes Supabase auth directly — confirms the endpoint is live, accepting OTPs, and ready for real users.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🔏</div>
      <div class="feat-title">Cryptographic signatures</div>
      <div class="feat-body">Every result is signed with Ed25519. Anyone holding the public key can verify any attestation independently — no trust required.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🤖</div>
      <div class="feat-title">MCP native</div>
      <div class="feat-body">Vantage speaks MCP over Streamable HTTP. Any Claude agent, Aitonoma workflow, or custom agent can call it directly.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">📋</div>
      <div class="feat-title">Audit-ready bundles</div>
      <div class="feat-body">Task-level attestation bundles tie every verified outcome to a specific agent, job ID, and timestamp. Show anyone, export anytime.</div>
    </div>
  </div>
</div>

<!-- CTA bottom -->
<div class="cta-bottom">
  <div class="cta-inner">
    <h2>Ready to verify everything?</h2>
    <p>Open the dashboard, paste a Supabase URL, and see a signed attestation in under 60 seconds.</p>
    <a href="/dashboard" class="btn-primary">Open Dashboard →</a>
  </div>
</div>

<footer>
  <span>© 2026 Vantage — Agyeman Enterprises</span>
  <a href="/dashboard">Dashboard →</a>
</footer>

</body>
</html>`;
}
