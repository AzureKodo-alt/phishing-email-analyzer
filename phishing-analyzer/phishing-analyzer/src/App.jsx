import { useState, useEffect } from "react";

const SAMPLE_EMAIL = `From: security-alert@paypa1-verify.com
To: victim@company.com
Subject: URGENT: Your account has been suspended - Action Required
Date: Wed, 27 May 2026 03:14:22 +0000
Reply-To: no-reply@paypa1-verify.com
X-Mailer: Microsoft Outlook 16.0

Dear Valued Customer,

We have detected suspicious activity on your PayPal account. Your account has been temporarily suspended for your protection.

You must verify your identity within 24 HOURS or your account will be permanently closed and funds will be frozen.

Click here to verify: http://paypa1-secure-login.xyz/verify?token=8fh2k

Please provide:
- Full name
- Credit card number
- Social Security Number
- Password

Failure to comply will result in immediate account termination.

PayPal Security Team`;

const severityConfig = {
  CRITICAL: { color: "#ff2d55", bg: "rgba(255,45,85,0.1)", border: "rgba(255,45,85,0.3)" },
  HIGH: { color: "#ff9f0a", bg: "rgba(255,159,10,0.1)", border: "rgba(255,159,10,0.3)" },
  MEDIUM: { color: "#ffd60a", bg: "rgba(255,214,10,0.1)", border: "rgba(255,214,10,0.3)" },
  LOW: { color: "#30d158", bg: "rgba(48,209,88,0.1)", border: "rgba(48,209,88,0.3)" },
};

function TerminalText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ animation: "blink 1s infinite" }}>█</span>}
    </span>
  );
}

function IOCBadge({ label, value, type }) {
  const colors = {
    domain: { c: "#bf5af2", b: "rgba(191,90,242,0.15)" },
    ip: { c: "#ff9f0a", b: "rgba(255,159,10,0.15)" },
    url: { c: "#ff2d55", b: "rgba(255,45,85,0.15)" },
    email: { c: "#0a84ff", b: "rgba(10,132,255,0.15)" },
    hash: { c: "#30d158", b: "rgba(48,209,88,0.15)" },
  };
  const s = colors[type] || colors.domain;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.b, border: `1px solid ${s.c}40`,
      borderRadius: 4, padding: "4px 10px", margin: "3px",
      fontFamily: "'Courier Prime', monospace", fontSize: 12,
    }}>
      <span style={{ color: s.c, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ color: "#e0e0e0" }}>{value}</span>
    </div>
  );
}

function ResultSection({ title, icon, children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.4s ease",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(0,255,136,0.12)",
      borderRadius: 8, padding: "18px 20px", marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: "#00ff88", fontFamily: "'Courier Prime', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanText, setScanText] = useState("");
  const [activeTab, setActiveTab] = useState("input");

  const scanMessages = [
    "Initializing threat detection engine...",
    "Parsing email headers...",
    "Extracting IOCs...",
    "Analyzing sender reputation...",
    "Scanning for social engineering patterns...",
    "Checking URL anomalies...",
    "Calculating threat score...",
    "Generating SOC report...",
  ];

  async function analyzeEmail() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("result");

    let msgIndex = 0;
    setScanText(scanMessages[0]);
    const scanInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % scanMessages.length;
      setScanText(scanMessages[msgIndex]);
    }, 900);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a SOC (Security Operations Center) analyst specialized in phishing email analysis. Analyze the provided email and return ONLY a JSON object with no preamble, no markdown, no backticks. The JSON must have exactly this structure:
{
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "verdict": "one sentence verdict",
  "confidence": 0-100,
  "iocs": [{"type": "domain|ip|url|email|hash", "label": "Type", "value": "the value"}],
  "indicators": ["indicator 1", "indicator 2"],
  "social_engineering": ["tactic 1", "tactic 2"],
  "escalate": true|false,
  "escalation_reason": "reason if escalate is true, else empty string",
  "recommended_actions": ["action 1", "action 2"],
  "summary": "2-3 sentence professional SOC analyst summary of findings"
}`,
          messages: [{ role: "user", content: `Analyze this email for phishing indicators:\n\n${email}` }]
        })
      });

      const data = await response.json();
      clearInterval(scanInterval);

      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setLoading(false);
    } catch (err) {
      clearInterval(scanInterval);
      setError("Analysis failed. Check your connection and try again.");
      setLoading(false);
      setActiveTab("input");
    }
  }

  const sev = result ? severityConfig[result.severity] || severityConfig.LOW : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Courier Prime', monospace",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes scandown { 0%{top:-10%} 100%{top:110%} }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.6} 94%{opacity:1} 97%{opacity:0.8} 98%{opacity:1} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #00ff8840; border-radius: 2px; }
        textarea:focus { outline: none; }
        .tab-btn:hover { background: rgba(0,255,136,0.08) !important; }
      `}</style>

      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        animation: "flicker 8s infinite"
      }} />

      {/* Scan line effect */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)",
        zIndex: 1, animation: "scandown 6s linear infinite",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "30px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-block",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: 4, padding: "4px 12px", marginBottom: 12,
            fontSize: 11, color: "#00ff88", letterSpacing: 3, textTransform: "uppercase"
          }}>
            SOC Analyst Toolkit
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(22px, 5vw, 38px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 8px",
            letterSpacing: 2,
            textShadow: "0 0 30px rgba(0,255,136,0.3)"
          }}>
            PHISHING <span style={{ color: "#00ff88" }}>ANALYZER</span>
          </h1>
          <p style={{ color: "#666", fontSize: 13, letterSpacing: 1, margin: 0 }}>
            AI-POWERED THREAT DETECTION & IOC EXTRACTION
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(0,255,136,0.15)",
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,255,136,0.05), inset 0 0 60px rgba(0,0,0,0.3)",
          position: "relative"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(0,255,136,0.1)" }}>
            {["input", "result"].map(tab => (
              <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "14px", background: activeTab === tab ? "rgba(0,255,136,0.06)" : "transparent",
                  border: "none", borderBottom: activeTab === tab ? "2px solid #00ff88" : "2px solid transparent",
                  color: activeTab === tab ? "#00ff88" : "#444",
                  fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 2,
                  textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s"
                }}>
                {tab === "input" ? "⌨ Email Input" : "📊 Analysis Report"}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px", position: "relative", zIndex: 1 }}>

            {/* INPUT TAB */}
            {activeTab === "input" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ color: "#00ff88", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
                    ▸ Paste Email Content / Headers
                  </label>
                  <button onClick={() => setEmail(SAMPLE_EMAIL)}
                    style={{
                      background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)",
                      color: "#00ff88", padding: "5px 12px", borderRadius: 4, cursor: "pointer",
                      fontSize: 11, fontFamily: "'Courier Prime', monospace", letterSpacing: 1
                    }}>
                    Load Sample
                  </button>
                </div>

                <textarea
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={"Paste raw email content here...\n\nInclude headers for best results:\nFrom: sender@domain.com\nSubject: ...\nBody content..."}
                  style={{
                    width: "100%", height: 280, background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(0,255,136,0.15)", borderRadius: 6,
                    color: "#c8ffd4", fontFamily: "'Courier Prime', monospace",
                    fontSize: 13, padding: "14px", resize: "vertical",
                    lineHeight: 1.6, caretColor: "#00ff88",
                  }}
                />

                {error && (
                  <div style={{ color: "#ff2d55", fontSize: 12, marginTop: 8, padding: "8px 12px", background: "rgba(255,45,85,0.08)", borderRadius: 4, border: "1px solid rgba(255,45,85,0.2)" }}>
                    ⚠ {error}
                  </div>
                )}

                <button
                  onClick={analyzeEmail}
                  disabled={!email.trim() || loading}
                  style={{
                    width: "100%", marginTop: 14, padding: "14px",
                    background: email.trim() ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${email.trim() ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 6, color: email.trim() ? "#00ff88" : "#333",
                    fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 3,
                    textTransform: "uppercase", cursor: email.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: email.trim() ? "0 0 20px rgba(0,255,136,0.1)" : "none"
                  }}>
                  {loading ? "Analyzing..." : "▶ Run Threat Analysis"}
                </button>
              </div>
            )}

            {/* RESULT TAB */}
            {activeTab === "result" && (
              <div>
                {loading && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ marginBottom: 24 }}>
                      {[0,1,2,3,4].map(i => (
                        <div key={i} style={{
                          display: "inline-block", width: 8, height: 8,
                          background: "#00ff88", borderRadius: "50%", margin: "0 4px",
                          animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`
                        }} />
                      ))}
                    </div>
                    <div style={{ color: "#00ff88", fontSize: 13, letterSpacing: 1 }}>
                      <TerminalText text={scanText} key={scanText} />
                    </div>
                    <div style={{ color: "#333", fontSize: 11, marginTop: 8 }}>
                      AI threat analysis in progress
                    </div>
                  </div>
                )}

                {!loading && !result && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 13, letterSpacing: 1 }}>No analysis yet. Submit an email to begin.</div>
                  </div>
                )}

                {result && !loading && (
                  <div>
                    {/* Severity Banner */}
                    <div style={{
                      background: sev.bg, border: `1px solid ${sev.border}`,
                      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 12
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            background: sev.color, color: "#000", fontFamily: "'Orbitron', monospace",
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 3, letterSpacing: 2
                          }}>{result.severity}</span>
                          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{result.verdict}</span>
                        </div>
                        {result.escalate && (
                          <div style={{ color: "#ff2d55", fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
                            ⚡ ESCALATION REQUIRED — {result.escalation_reason}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#666", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>CONFIDENCE</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: sev.color }}>
                          {result.confidence}%
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <ResultSection title="Analyst Summary" icon="📋" delay={100}>
                      <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
                    </ResultSection>

                    {/* IOCs */}
                    {result.iocs?.length > 0 && (
                      <ResultSection title="Extracted IOCs" icon="🎯" delay={200}>
                        <div>{result.iocs.map((ioc, i) => (
                          <IOCBadge key={i} type={ioc.type} label={ioc.label} value={ioc.value} />
                        ))}</div>
                      </ResultSection>
                    )}

                    {/* Indicators */}
                    {result.indicators?.length > 0 && (
                      <ResultSection title="Phishing Indicators" icon="⚠️" delay={300}>
                        {result.indicators.map((ind, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                            <span style={{ color: "#ff2d55", marginTop: 1, flexShrink: 0 }}>▸</span>
                            <span style={{ color: "#ccc", fontSize: 13 }}>{ind}</span>
                          </div>
                        ))}
                      </ResultSection>
                    )}

                    {/* Social Engineering */}
                    {result.social_engineering?.length > 0 && (
                      <ResultSection title="Social Engineering Tactics" icon="🧠" delay={400}>
                        {result.social_engineering.map((tac, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                            <span style={{ color: "#bf5af2", marginTop: 1, flexShrink: 0 }}>▸</span>
                            <span style={{ color: "#ccc", fontSize: 13 }}>{tac}</span>
                          </div>
                        ))}
                      </ResultSection>
                    )}

                    {/* Recommended Actions */}
                    {result.recommended_actions?.length > 0 && (
                      <ResultSection title="Recommended Actions" icon="✅" delay={500}>
                        {result.recommended_actions.map((act, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                            <span style={{
                              background: "rgba(48,209,88,0.15)", color: "#30d158",
                              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3,
                              flexShrink: 0, marginTop: 1, fontFamily: "'Orbitron', monospace"
                            }}>{i + 1}</span>
                            <span style={{ color: "#ccc", fontSize: 13 }}>{act}</span>
                          </div>
                        ))}
                      </ResultSection>
                    )}

                    <button onClick={() => { setActiveTab("input"); setEmail(""); setResult(null); }}
                      style={{
                        width: "100%", padding: "12px", marginTop: 4,
                        background: "transparent", border: "1px solid rgba(0,255,136,0.15)",
                        borderRadius: 6, color: "#444", fontFamily: "'Courier Prime', monospace",
                        fontSize: 12, cursor: "pointer", letterSpacing: 2,
                        transition: "all 0.2s"
                      }}
                      onMouseOver={e => { e.target.style.color = "#00ff88"; e.target.style.borderColor = "rgba(0,255,136,0.3)"; }}
                      onMouseOut={e => { e.target.style.color = "#444"; e.target.style.borderColor = "rgba(0,255,136,0.15)"; }}>
                      ↩ Analyze Another Email
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, color: "#2a2a2a", fontSize: 11, letterSpacing: 2 }}>
          PHISHING ANALYZER · SOC ANALYST PORTFOLIO TOOL · POWERED BY CLAUDE AI
        </div>
      </div>
    </div>
  );
}
