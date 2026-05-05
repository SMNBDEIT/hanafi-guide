import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   HANAFI GUIDE  —  Fiqh AI Assistant
   Uses the Anthropic Claude API (claude-sonnet-4-20250514)
   Drop your ANTHROPIC_API_KEY in the constant below.
───────────────────────────────────────────── */
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE"; // ← replace this

const SYSTEM_PROMPT = `You are a knowledgeable Islamic scholar specializing strictly in the Hanafi madhab (school of Islamic jurisprudence), founded by Imam Abu Hanifa Nu'man ibn Thabit (رحمه الله).

RULES:
1. Answer ALL fiqh questions EXCLUSIVELY from the Hanafi madhab position.
2. Primary references: Al-Hidayah (al-Marghinani), Mukhtasar al-Quduri, Radd al-Muhtar (Ibn Abidin), Fatawa Alamgiri, Al-Ikhtiyar (al-Mawsili).
3. Cite relevant Hanafi texts or principles when possible.
4. If a question is outside Islamic fiqh, politely redirect: "This assistant is designed for Hanafi fiqh questions."
5. Always end sensitive personal rulings with: "Please consult a qualified Hanafi scholar for a personal fatwa."
6. Use phrases like "According to the Hanafi school…", "The Hanafi position holds…", "Imam Abu Hanifa's view is…"
7. Respond in the language the user uses. Use Islamic terminology with translations where helpful.
8. Begin responses with bismillah or an appropriate Islamic greeting where natural.`;

const SUGGESTIONS = [
  "What is the Hanafi ruling on wiping over socks (khuffayn) during wudu?",
  "How does the Hanafi school calculate the nisab for zakat?",
  "What are the conditions for a valid nikah according to Hanafi fiqh?",
  "Is it permissible to work in conventional banking according to Hanafi scholars?",
];

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Naskh+Arabic:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap');

  :root {
    --bg-deep:    #0b0d0c;
    --bg-mid:     #111612;
    --bg-surface: #161c16;
    --bg-elevated:#1c2420;
    --bg-card:    #1e2822;
    --border:     #2a3830;
    --border-hi:  #3a5040;
    --gold:       #c9a96e;
    --gold-lt:    #e2c48a;
    --gold-dk:    #8a6e3e;
    --gold-fade:  rgba(201,169,110,0.08);
    --green:      #4a7c59;
    --green-lt:   #6aad7e;
    --green-fade: rgba(74,124,89,0.1);
    --text-hi:    #eaf0eb;
    --text-mid:   #97ae9a;
    --text-lo:    #556859;
    --r-sm: 6px; --r-md: 12px; --r-lg: 20px;
    --ff-disp: 'Cormorant Garamond', Georgia, serif;
    --ff-body: 'Source Serif 4', Georgia, serif;
    --ff-arab: 'Noto Naskh Arabic', serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg-deep);
    color: var(--text-hi);
    font-family: var(--ff-body);
    height: 100vh;
    overflow: hidden;
  }

  .hg-wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 860px;
    margin: 0 auto;
    position: relative;
  }

  /* geometric bg */
  .hg-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(74,124,89,0.07) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(201,169,110,0.06) 0%, transparent 50%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%232a3830' stroke-width='0.5' opacity='0.5'%3E%3Cpolygon points='40,2 74,22 74,58 40,78 6,58 6,22'/%3E%3Cpolygon points='40,14 66,28 66,52 40,66 14,52 14,28'/%3E%3Cline x1='40' y1='2' x2='40' y2='14'/%3E%3Cline x1='74' y1='22' x2='66' y2='28'/%3E%3Cline x1='74' y1='58' x2='66' y2='52'/%3E%3Cline x1='40' y1='78' x2='40' y2='66'/%3E%3Cline x1='6' y1='58' x2='14' y2='52'/%3E%3Cline x1='6' y1='22' x2='14' y2='28'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* ── Header ── */
  .hg-header {
    position: relative; z-index: 2;
    display: flex; align-items: center; gap: 14px;
    padding: 18px 24px 14px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(11,13,12,0.97) 0%, rgba(11,13,12,0.75) 100%);
    backdrop-filter: blur(14px);
    flex-shrink: 0;
  }
  .hg-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .hg-title {
    font-family: var(--ff-disp);
    font-size: 1.55rem; font-weight: 600;
    color: var(--gold-lt); letter-spacing: 0.02em; line-height: 1.1;
  }
  .hg-sub {
    font-family: var(--ff-arab);
    font-size: 0.83rem; color: var(--text-mid);
    margin-top: 2px; direction: rtl;
  }
  .hg-badge {
    margin-left: auto;
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--green-lt);
    background: var(--green-fade);
    border: 1px solid rgba(106,173,126,0.2);
    padding: 4px 10px; border-radius: 20px;
    white-space: nowrap;
  }

  /* ── API Key Banner ── */
  .hg-key-banner {
    position: relative; z-index: 2;
    background: rgba(180,120,30,0.1);
    border-bottom: 1px solid rgba(201,169,110,0.2);
    padding: 10px 24px;
    font-size: 0.82rem; color: var(--gold);
    display: flex; align-items: center; gap: 10px;
  }
  .hg-key-input {
    flex: 1; background: rgba(0,0,0,0.3);
    border: 1px solid var(--border-hi);
    border-radius: var(--r-sm);
    color: var(--text-hi); font-family: monospace; font-size: 0.8rem;
    padding: 5px 10px; outline: none;
  }
  .hg-key-input:focus { border-color: var(--gold-dk); }
  .hg-key-btn {
    background: var(--gold-dk); color: #0b0d0c;
    border: none; border-radius: var(--r-sm);
    padding: 6px 14px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .hg-key-btn:hover { background: var(--gold); }

  /* ── Messages ── */
  .hg-msgs {
    position: relative; z-index: 1;
    flex: 1; overflow-y: auto;
    padding: 24px 20px;
    display: flex; flex-direction: column; gap: 18px;
    scroll-behavior: smooth;
  }
  .hg-msgs::-webkit-scrollbar { width: 4px; }
  .hg-msgs::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

  /* ── Welcome ── */
  .hg-welcome {
    margin: auto;
    text-align: center; max-width: 500px; padding: 20px;
    animation: fadeUp 0.6s ease both;
  }
  .hg-mosque { font-size: 3rem; display: block; margin-bottom: 18px;
    filter: drop-shadow(0 0 18px rgba(201,169,110,0.4)); }
  .hg-bism {
    font-family: var(--ff-arab); font-size: 1.4rem;
    color: var(--gold); margin-bottom: 14px; direction: rtl; letter-spacing: 0.05em;
  }
  .hg-wtitle {
    font-family: var(--ff-disp); font-size: 1.85rem; font-weight: 600;
    color: var(--text-hi); margin-bottom: 10px; line-height: 1.2;
  }
  .hg-wdesc {
    font-size: 0.92rem; color: var(--text-mid); line-height: 1.75; margin-bottom: 26px;
  }
  .hg-wdesc strong { color: var(--gold); font-weight: 500; }
  .hg-sqhead {
    font-family: var(--ff-disp); font-size: 0.8rem;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-lo); margin-bottom: 8px; text-align: left;
  }
  .hg-sq-list { display: flex; flex-direction: column; gap: 7px; }
  .hg-sq {
    background: var(--bg-card); border: 1px solid var(--border);
    color: var(--text-mid); padding: 10px 15px; border-radius: var(--r-md);
    cursor: pointer; font-family: var(--ff-body); font-size: 0.85rem;
    text-align: left; transition: all 0.18s ease;
    position: relative; overflow: hidden;
  }
  .hg-sq::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--gold); opacity: 0; transition: opacity 0.18s;
  }
  .hg-sq:hover { border-color: var(--border-hi); color: var(--text-hi); background: var(--bg-elevated); }
  .hg-sq:hover::before { opacity: 1; }

  /* ── Chat Rows ── */
  .hg-row { display: flex; gap: 10px; animation: fadeUp 0.3s ease both; }
  .hg-row.user { flex-direction: row-reverse; }
  .hg-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem; flex-shrink: 0;
  }
  .hg-row.user .hg-avatar { background: var(--green-fade); border: 1px solid rgba(106,173,126,0.2); }
  .hg-row.assistant .hg-avatar { background: var(--gold-fade); border: 1px solid rgba(201,169,110,0.15); }
  .hg-bubble {
    max-width: 78%; padding: 13px 17px; font-size: 0.91rem;
    line-height: 1.78; border-radius: var(--r-lg);
  }
  .hg-row.user .hg-bubble {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-top-right-radius: 4px;
  }
  .hg-row.assistant .hg-bubble {
    background: var(--bg-card); border: 1px solid var(--border);
    border-top-left-radius: 4px;
  }
  .hg-bubble strong { color: var(--gold-lt); font-weight: 600; }
  .hg-bubble em { color: var(--text-mid); font-style: italic; }
  .hg-bubble code {
    background: rgba(0,0,0,0.3); padding: 1px 5px;
    border-radius: 4px; font-size: 0.87em; color: var(--green-lt); font-family: monospace;
  }
  .hg-bubble h3 {
    font-family: var(--ff-disp); color: var(--gold);
    font-size: 1.05rem; margin: 12px 0 5px;
  }
  .hg-bubble h4 {
    font-family: var(--ff-disp); color: var(--gold-lt);
    font-size: 0.97rem; margin: 10px 0 4px;
  }
  .hg-bubble ul, .hg-bubble ol { margin: 6px 0 6px 18px; }
  .hg-bubble li { margin: 3px 0; }

  /* Typing cursor */
  .typing-cursor::after {
    content: '▋'; animation: blink 0.75s step-end infinite;
    color: var(--gold); font-size: 0.88em; margin-left: 1px;
  }

  /* ── Thinking dots ── */
  .hg-dots {
    display: flex; align-items: center; gap: 5px;
    padding: 13px 17px; background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r-lg); border-top-left-radius: 4px;
  }
  .hg-dot {
    width: 6px; height: 6px; background: var(--gold-dk);
    border-radius: 50%; animation: dotBounce 1.3s ease-in-out infinite;
  }
  .hg-dot:nth-child(2) { animation-delay: 0.18s; }
  .hg-dot:nth-child(3) { animation-delay: 0.36s; }

  /* ── Error ── */
  .hg-err {
    background: rgba(180,55,55,0.1); border: 1px solid rgba(180,55,55,0.25);
    color: #e09090; padding: 10px 15px; border-radius: var(--r-md);
    font-size: 0.87rem; animation: fadeUp 0.3s ease;
  }

  /* ── Input ── */
  .hg-input-area {
    position: relative; z-index: 2;
    padding: 14px 20px 18px;
    border-top: 1px solid var(--border);
    background: linear-gradient(0deg, rgba(11,13,12,0.98) 0%, rgba(11,13,12,0.82) 100%);
    backdrop-filter: blur(14px);
    flex-shrink: 0;
  }
  .hg-input-row {
    display: flex; gap: 8px; align-items: flex-end;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 9px 9px 9px 17px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .hg-input-row:focus-within {
    border-color: var(--border-hi);
    box-shadow: 0 0 0 3px rgba(201,169,110,0.06);
  }
  .hg-textarea {
    flex: 1; background: none; border: none; outline: none;
    color: var(--text-hi); font-family: var(--ff-body);
    font-size: 0.92rem; line-height: 1.6;
    resize: none; max-height: 150px; overflow-y: auto; padding: 4px 0;
  }
  .hg-textarea::placeholder { color: var(--text-lo); }
  .hg-send {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--gold); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #0b0d0c; flex-shrink: 0;
    transition: background 0.2s, transform 0.15s;
  }
  .hg-send:hover:not(:disabled) { background: var(--gold-lt); transform: scale(1.06); }
  .hg-send:disabled { background: var(--bg-elevated); color: var(--text-lo); cursor: not-allowed; transform: none; }
  .hg-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 8px; padding: 0 3px;
  }
  .hg-hint { font-size: 0.73rem; color: var(--text-lo); }
  .hg-clear {
    font-size: 0.73rem; color: var(--text-lo); background: none;
    border: none; cursor: pointer; padding: 2px 5px;
    border-radius: 4px; transition: color 0.2s;
  }
  .hg-clear:hover { color: var(--gold-dk); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink { 50% { opacity: 0; } }
  @keyframes dotBounce {
    0%,60%,100% { transform: translateY(0); }
    30%         { transform: translateY(-5px); }
  }

  @media (max-width: 600px) {
    .hg-header { padding: 12px 14px 10px; }
    .hg-msgs   { padding: 14px 10px; }
    .hg-input-area { padding: 10px 12px 14px; }
    .hg-bubble { max-width: 88%; }
  }
`;

/* ── Simple Markdown renderer ── */
function renderMd(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>")
    .replace(/^[-•]\s(.+)$/gm, "<li style='list-style:disc'>$1</li>")
    .replace(/(<li[\s\S]*?<\/li>(?:\n|$))+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

/* ── Logo SVG ── */
function Logo() {
  return (
    <svg className="hg-logo" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="none" stroke="#c9a96e" strokeWidth="1.2"/>
      <polygon points="22,9 35,17 35,27 22,35 9,27 9,17" fill="none" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="22" y1="2" x2="22" y2="9" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="40" y1="12" x2="35" y2="17" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="40" y1="32" x2="35" y2="27" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="22" y1="42" x2="22" y2="35" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="4" y1="32" x2="9" y2="27" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <line x1="4" y1="12" x2="9" y2="17" stroke="#c9a96e" strokeWidth="0.55" opacity="0.45"/>
      <text x="22" y="28" textAnchor="middle" fontFamily="Noto Naskh Arabic,serif" fontSize="14" fill="#c9a96e">ح</text>
    </svg>
  );
}

/* ── Send icon ── */
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163z"/>
    </svg>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
export default function HanafiGuide() {
  const [messages, setMessages]         = useState([]);   // {role, content}[]
  const [input, setInput]               = useState("");
  const [streaming, setStreaming]       = useState(false);
  const [apiKey, setApiKey]             = useState(API_KEY);
  const [keyInput, setKeyInput]         = useState("");
  const [showKeyBanner, setShowKeyBanner] = useState(API_KEY === "YOUR_ANTHROPIC_API_KEY_HERE");

  const msgsEndRef   = useRef(null);
  const textareaRef  = useRef(null);
  const abortRef     = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = (e) => {
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 150) + "px";
    setInput(ta.value);
  };

  const canSend = input.trim().length > 0 && !streaming && apiKey !== "YOUR_ANTHROPIC_API_KEY_HERE";

  const saveKey = () => {
    if (keyInput.trim().startsWith("sk-")) {
      setApiKey(keyInput.trim());
      setShowKeyBanner(false);
    }
  };

  /* ── Send message ── */
  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    // placeholder assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    const history = [...messages, userMsg];

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          stream: true,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";
      let full      = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              full += evt.delta.text;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: full, streaming: true };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }

      // finalise
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: full };
        return copy;
      });

    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "", error: err.message };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, apiKey]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  /* ── Render ── */
  return (
    <>
      <style>{styles}</style>
      <div className="hg-wrap">

        {/* Header */}
        <header className="hg-header">
          <Logo />
          <div>
            <div className="hg-title">Hanafi Guide</div>
            <div className="hg-sub">دليل فقه الحنفية</div>
          </div>
          <span className="hg-badge">Hanafi Madhab</span>
        </header>

        {/* API Key Banner */}
        {showKeyBanner && (
          <div className="hg-key-banner">
            <span>🔑 Enter your Anthropic API key:</span>
            <input
              className="hg-key-input"
              type="password"
              placeholder="sk-ant-..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveKey()}
            />
            <button className="hg-key-btn" onClick={saveKey}>Save</button>
          </div>
        )}

        {/* Messages */}
        <div className="hg-msgs">
          {messages.length === 0 ? (
            <div className="hg-welcome">
              <span className="hg-mosque">🕌</span>
              <div className="hg-bism">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
              <h1 className="hg-wtitle">Ask about Hanafi Fiqh</h1>
              <p className="hg-wdesc">
                This assistant answers Islamic jurisprudence questions strictly according to the{" "}
                <strong>Hanafi madhab</strong> — founded by Imam Abu Hanifa (رحمه الله), the most
                widely followed school of Islamic law.
              </p>
              <div className="hg-sqhead">Try asking…</div>
              <div className="hg-sq-list">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="hg-sq" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              if (msg.error) {
                return (
                  <div key={i} className="hg-err">⚠️ {msg.error}</div>
                );
              }
              return (
                <div key={i} className={`hg-row ${msg.role}`}>
                  <div className="hg-avatar">{msg.role === "user" ? "🧑" : "📖"}</div>
                  <div
                    className={`hg-bubble${msg.streaming ? " typing-cursor" : ""}`}
                    dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
                  />
                </div>
              );
            })
          )}

          {/* Thinking dots (shown when streaming but no content yet) */}
          {streaming && messages.length > 0 && messages[messages.length - 1].content === "" && !messages[messages.length - 1].error && (
            <div className="hg-row assistant">
              <div className="hg-avatar">📖</div>
              <div className="hg-dots">
                <div className="hg-dot"/><div className="hg-dot"/><div className="hg-dot"/>
              </div>
            </div>
          )}

          <div ref={msgsEndRef} />
        </div>

        {/* Input */}
        <div className="hg-input-area">
          <div className="hg-input-row">
            <textarea
              ref={textareaRef}
              className="hg-textarea"
              placeholder="Ask a fiqh question…"
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={streaming}
            />
            <button className="hg-send" onClick={() => sendMessage()} disabled={!canSend}>
              <SendIcon />
            </button>
          </div>
          <div className="hg-footer">
            <span className="hg-hint">Enter to send · Shift+Enter for new line</span>
            <button className="hg-clear" onClick={clearChat}>Clear chat</button>
          </div>
        </div>

      </div>
    </>
  );
}
