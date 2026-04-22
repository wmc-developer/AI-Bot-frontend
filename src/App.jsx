import { useEffect, useRef, useState } from 'react';
import './App.css';
import wmcLogo from './assets/wmc-official-logo.png';

const API_BASE = import.meta.env.VITE_API_BASE;
const CAMPAIGN_ID = import.meta.env.VITE_CAMPAIGN_ID;

function StarCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const STAR_COUNT = 180;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.6 + 0.15,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    const SHOOT_INTERVAL = 2800;
    const shooters = [];
    let lastShoot = 0;

    const spawnShooter = () => {
      shooters.push({
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        vx: Math.random() * 6 + 4,
        vy: Math.random() * 3 + 1.5,
        len: Math.random() * 120 + 60,
        life: 1,
      });
    };

    const draw = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${s.opacity})`;
        ctx.fill();
      }

      if (ts - lastShoot > SHOOT_INTERVAL) { spawnShooter(); lastShoot = ts; }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.018;
        if (sh.life <= 0) { shooters.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(
          sh.x - sh.vx * (sh.len / sh.vx), sh.y - sh.vy * (sh.len / sh.vx), sh.x, sh.y
        );
        grad.addColorStop(0, `rgba(255, 120, 30, 0)`);
        grad.addColorStop(1, `rgba(255, 200, 100, ${sh.life * 0.9})`);
        ctx.beginPath();
        ctx.moveTo(sh.x - sh.vx * (sh.len / sh.vx), sh.y - sh.vy * (sh.len / sh.vx));
        ctx.lineTo(sh.x, sh.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const SCORE_REGEX = /\b(\d{1,3})(?:[-–](\d{1,3}))?\/100\b/;

function ScoreCard({ low, high }) {
  const display = high ? `${low}–${high}` : `${low}`;
  const pct = high ? (low + high) / 2 : low;
  const dash = 2 * Math.PI * 42;
  const offset = dash - (pct / 100) * dash;
  const [count, setCount] = useState(0);
  const target = high ? Math.round((low + high) / 2) : low;

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="score-card">
      <div className="score-ring-wrap">
        <svg className="score-ring" viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke="url(#scoreGrad)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFAE00" />
              <stop offset="100%" stopColor="#ffd166" />
            </linearGradient>
          </defs>
        </svg>
        <div className="score-inner">
          <span className="score-num">{count}</span>
          <span className="score-denom">/100</span>
        </div>
      </div>
      <div className="score-label">Marketing Score</div>
      {high && <div className="score-range">{display} / 100 estimated</div>}
      <a
        href="https://meetings.hubspot.com/reddaway/wmc-nick-reddaway-discovery?uuid=1d75b9eb-fd39-4ae2-a206-03f9e3497f70"
        target="_blank"
        rel="noopener noreferrer"
        className="book-btn score-cta"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        Book a Free Consultation
      </a>
    </div>
  );
}

const BOOKING_REGEX = /https?:\/\/meetings\.hubspot\.com\/[^\s]+/;

function MessageText({ content }) {
  const match = content.match(SCORE_REGEX);
  const bookingMatch = content.match(BOOKING_REGEX);
  const parts = content.split(URL_REGEX);
  return (
    <>
      {match && (
        <ScoreCard low={parseInt(match[1])} high={match[2] ? parseInt(match[2]) : null} />
      )}
      {parts.map((part, i) =>
        URL_REGEX.test(part)
          ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="msg-link">{part}</a>
          : part
      )}
      {bookingMatch && (
        <div style={{ marginTop: '12px' }}>
          <a href={bookingMatch[0]} target="_blank" rel="noopener noreferrer" className="book-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Book a Meeting
          </a>
        </div>
      )}
    </>
  );
}


function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function App() {
  // phase: 'loading' | 'form' | 'chat' | 'error'
  const [phase, setPhase] = useState('loading');
  const [, setCampaign] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  const STORAGE_KEY = `wmc_session_${CAMPAIGN_ID}`;

  // Load campaign info on mount; resume previous session if available
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    fetch(`${API_BASE}/api/chat/${CAMPAIGN_ID}`)
      .then((r) => r.json())
      .then(async (res) => {
        if (!res.success) { setErrorMsg(res.message || 'Chat not available.'); setPhase('error'); return; }
        setCampaign(res.data);

        if (saved) {
          try {
            const hist = await fetch(`${API_BASE}/api/chat/${CAMPAIGN_ID}/history?sessionId=${saved}`).then((r) => r.json());
            if (hist.success && Array.isArray(hist.data) && hist.data.length > 0) {
              setSessionId(saved);
              setMessages(hist.data.map((m) => ({ role: m.role === 'assistant' ? 'bot' : 'user', content: m.content })));
              setPhase('chat');
              return;
            }
          } catch { /* fall through to form */ }
          localStorage.removeItem(STORAGE_KEY);
        }

        setPhase('form');
      })
      .catch(() => { setErrorMsg('Could not connect to server.'); setPhase('error'); });
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (messages.length <= 1 && !typing) {
      scrollRef.current.scrollTop = 0;
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const apply = () => {
      document.documentElement.style.setProperty('--app-h', `${vv.height}px`);
      window.scrollTo(0, 0);
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
    };
  }, []);


  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [input]);

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/${CAMPAIGN_ID}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        }),
      }).then((r) => r.json());

      if (!res.success) { setFormError(res.message || 'Failed to start chat.'); setFormLoading(false); return; }

      const sid = res.data.sessionId;
      setSessionId(sid);
      localStorage.setItem(STORAGE_KEY, sid);

      // Try to load existing history (returning user resumes full conversation)
      try {
        const hist = await fetch(`${API_BASE}/api/chat/${CAMPAIGN_ID}/history?sessionId=${sid}`).then((r) => r.json());
        if (hist.success && Array.isArray(hist.data) && hist.data.length > 0) {
          setMessages(hist.data.map((m) => ({ role: m.role === 'assistant' ? 'bot' : 'user', content: m.content })));
          setPhase('chat');
          setFormLoading(false);
          return;
        }
      } catch { /* fall through to show greeting */ }

      // New session — show greeting only
      const msgs = [];
      if (res.data.firstMessage) msgs.push({ role: 'bot', content: res.data.firstMessage });
      setMessages(msgs);
      setPhase('chat');
    } catch {
      setFormError('Could not connect to server.');
    }
    setFormLoading(false);
  };

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: 'user', content: t }]);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/${CAMPAIGN_ID}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: t }),
      }).then((r) => r.json());

      if (res.success && res.data?.reply) {
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === 'bot' && last.content === res.data.reply) return m;
          return [...m, { role: 'bot', content: res.data.reply }];
        });
      } else {
        setMessages((m) => [...m, { role: 'bot', content: res.message || 'Sorry, I could not get a response.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'bot', content: 'Network error — please try again.' }]);
    }
    setTyping(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const resetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="app">
      <StarCanvas />

      <header className="header">
        <div className="brand">
          <img src={wmcLogo} alt="Wingman Creative" className="brand-logo" />
        </div>
        <div className="status">
          <span className="dot" /> Online
          <button type="button" onClick={resetSession} className="dev-reset" aria-label="Reset session">
            Reset
          </button>
        </div>
      </header>

      {phase === 'loading' && (
        <div className="phase-center">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="phase-center">
          <p className="phase-error">{errorMsg}</p>
        </div>
      )}

      {phase === 'form' && (
        <div className="phase-center">
          <form className="lead-form" onSubmit={submitForm} noValidate>
            <div className="lead-form-header">
              <h2>Marketing Strength Calculator</h2>
              <p>Please enter your details to begin chat</p>
            </div>

            <div className="field">
              <label htmlFor="lf-name">Name <span>*</span></label>
              <input
                id="lf-name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lf-email">Email <span>*</span></label>
              <input
                id="lf-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lf-phone">Phone <span className="optional">(optional)</span></label>
              <input
                id="lf-phone"
                type="tel"
                placeholder="+61 400 000 000"
                value={formData.phone}
                onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="form-submit" disabled={formLoading}>
              {formLoading ? 'Starting…' : 'Start Chat →'}
            </button>
          </form>
        </div>
      )}

      {phase === 'chat' && (
        <>
          <main className="chat" ref={scrollRef}>
            <div className="chat-inner">
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className={`avatar ${m.role}`}>{m.role === 'bot' ? <img src={wmcLogo} alt="Wingman" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> : 'You'}</div>
                  <div className={`bubble ${m.role}`}><MessageText content={m.content} /></div>
                </div>
              ))}
              {typing && (
                <div className="msg-row bot">
                  <div className="avatar bot"><img src={wmcLogo} alt="Wingman" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /></div>
                  <div className="bubble bot"><div className="typing"><span /><span /><span /></div></div>
                </div>
              )}
            </div>
          </main>

          <div className="composer-wrap">
            <div className="composer">
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  setTimeout(() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTop = messages.length <= 1 ? 0 : scrollRef.current.scrollHeight;
                    }
                  }, 300);
                }}
                placeholder="Ask about your marketing score…"
              />
              <button className="send" onClick={() => send()} disabled={!input.trim() || typing} aria-label="Send">
                <SendIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
