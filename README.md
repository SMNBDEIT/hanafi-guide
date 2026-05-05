# 🕌 Hanafi Guide — AI Fiqh Assistant

<div align="center">

**An AI-powered chatbot that answers Islamic jurisprudence questions strictly according to the Hanafi madhab.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![React](https://img.shields.io/badge/React-JSX-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold?style=flat-square)](LICENSE)

<br/>

*بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ*

![Hanafi Guide Preview](https://via.placeholder.com/860x480/0c0e0d/c9a96e?text=Hanafi+Guide+%F0%9F%95%8C)

</div>

---

## 📖 About

**Hanafi Guide** is a conversational AI assistant grounded exclusively in the **Hanafi madhab** — one of the four major Sunni schools of Islamic jurisprudence, founded by Imam Abu Hanifa Nu'man ibn Thabit (رحمه الله, d. 767 CE / 150 AH).

The system prompt constrains all responses to classical Hanafi sources, so users always receive answers from a consistent, well-defined jurisprudential position. It is designed for educational use — students of fiqh, new Muslims, or anyone exploring Hanafi rulings.

> ⚠️ **Disclaimer:** This tool provides educational information only. For personal religious rulings (fatwas), always consult a qualified Hanafi scholar or mufti.

---

## ✨ Features

- 🤖 **Hanafi-only AI** — system prompt locks responses to the Hanafi position with source citations
- ⚡ **Streaming responses** — real-time text via Server-Sent Events (SSE)
- 💬 **Multi-turn conversation** — context-aware chat with full history support
- 🌐 **Beautiful web UI** — Islamic geometric dark UI with gold accents, served as static files
- ⚛️ **Standalone React component** — drop `HanafiGuide.jsx` into any React/Vite project
- 🛡️ **Input validation** — server-side sanitization of messages and history
- 🚦 **Rate limiting** — configurable per-IP request throttling
- 🩺 **Health check endpoint** — `/api/health` for uptime monitoring

---

## 🗂️ Project Structure

```
hanafi-guide/
├── app.js                        # Express entry point
├── package.json
├── .env.example                  # Environment variable template
│
├── config/
│   └── openai.js                 # OpenAI client initialization
│
├── controllers/
│   └── chatController.js         # Streaming + simple chat handlers
│
├── middleware/
│   ├── validateInput.js          # Request body validation
│   └── errorHandler.js           # Global error handling
│
├── routes/
│   └── chatRoutes.js             # API routes + rate limiting
│
├── utils/
│   └── systemPrompt.js           # Hanafi system prompt & message builder
│
└── hanafi-guide/
    └── public/
        └── index.html            # Web frontend (served as static files)
```

---

## 🚀 Getting Started (Node.js Backend)

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/account/api-keys)

### 1. Clone & Install

```bash
git clone https://github.com/SMNBDEIT/hanafi-guide.git
cd hanafi-guide
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-...your-key-here...
PORT=3000
OPENAI_MODEL=gpt-4o        # or gpt-4o-mini for lower cost
RATE_LIMIT_MAX=50          # requests per 15 min per IP
```

### 3. Run

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)**

---

## ⚛️ Getting Started (React / Browser)

A self-contained `HanafiGuide.jsx` component is included. It calls the **Anthropic Claude API** directly from the browser — no backend needed.

### 1. Scaffold a Vite project

```bash
npm create vite@latest hanafi-app -- --template react
cd hanafi-app
npm install
```

### 2. Add the component

Copy `HanafiGuide.jsx` into `src/`, then update `src/App.jsx`:

```jsx
import HanafiGuide from './HanafiGuide'
export default () => <HanafiGuide />
```

### 3. Add your API key

Open `HanafiGuide.jsx` and replace line 9:

```js
const API_KEY = "sk-ant-...your-anthropic-key...";
```

Or leave the placeholder — the app will show an in-UI key input on first load.

### 4. Run

```bash
npm run dev   # → http://localhost:5173
```

---

## 🔌 REST API Reference

### `POST /api/chat` — Streaming (SSE)

Returns a real-time stream of the AI response.

**Request**
```json
{
  "message": "What is the Hanafi ruling on wiping over socks during wudu?",
  "history": [
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response** — `Content-Type: text/event-stream`
```
data: {"type":"chunk","content":"Bismillah. According to..."}
data: {"type":"chunk","content":" the Hanafi madhab..."}
data: {"type":"done","fullContent":"Bismillah. According to the Hanafi madhab..."}
```

---

### `POST /api/chat/simple` — JSON

Returns the full response as a single JSON object. Useful for programmatic integrations.

**Response**
```json
{
  "success": true,
  "reply": "Bismillah. According to the Hanafi madhab...",
  "usage": {
    "prompt_tokens": 420,
    "completion_tokens": 215
  }
}
```

---

### `GET /api/health`

```json
{
  "status": "ok",
  "service": "Hanafi Guide AI",
  "model": "gpt-4o",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 📚 About the Hanafi Madhab

The **Hanafi madhab** is the oldest and most widely followed school of Islamic law, predominant in South Asia, Central Asia, Turkey, and much of the Arab world. It is distinguished by its systematic use of:

| Principle | Description |
|---|---|
| **Qiyas** | Analogical reasoning from Quran & Sunnah |
| **Istihsan** | Juristic preference / equitable deviation |
| **Urf** | Recognition of established custom |

**Primary classical references used by this assistant:**

- *Al-Hidayah* — Imam Burhan al-Din al-Marghinani
- *Mukhtasar al-Quduri* — Imam Ahmad al-Quduri
- *Radd al-Muhtar (Ibn Abidin)* — Muhammad Amin Ibn Abidin
- *Fatawa Alamgiri* — Compiled under Mughal Emperor Aurangzeb
- *Al-Ikhtiyar li-Ta'lil al-Mukhtar* — Imam Abdullah al-Mawsili

---

## 🛠️ Extend This Project

The README hints at building more interfaces on top — here are some ideas:

- **Telegram Bot** — wire `POST /api/chat/simple` to the Telegram Bot API
- **WhatsApp Bot** — use Twilio or the WhatsApp Cloud API
- **Mobile App** — React Native with the same `HanafiGuide.jsx` logic
- **Voice Interface** — pipe responses to a TTS service
- **Topic-specific modes** — salah, zakat, fasting, nikah — each with a focused sub-prompt

---

## 🤝 Contributing

Contributions are welcome! If you find a fiqh ruling that is incorrectly attributed, a missing source reference, or want to add a language, please open an issue or pull request.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Commit: `git commit -m 'Add: improved zakat prompt coverage'`
4. Push and open a PR

---

## 📄 License

[MIT](LICENSE) — free to use, fork, and build upon. Please retain attribution.

---

<div align="center">
  <sub>Built with respect for Islamic scholarship. Not a substitute for a qualified scholar.</sub>
</div>
