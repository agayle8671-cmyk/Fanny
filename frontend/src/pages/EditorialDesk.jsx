import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Lock, Unlock, Key, LogOut, RefreshCw, Search, Trash2, Save,
  Plus, ArrowUp, ArrowDown, Sparkles, Eye, AlertTriangle,
  CheckCircle, Clock, X, FileText, Terminal, Zap, Radio,
  Database, Activity, TrendingUp, Globe, ChevronRight
} from "lucide-react";
import { api, timeAgo, fallbackThumb } from "../lib/api";
import { slugify } from "../components/ArticleTOC";

const CATEGORIES = ["Leaks", "Tech", "Story", "Media", "World", "Markets"];

const CATEGORY_COLOR = {
  Leaks:   { text: "#FF2A6D", bg: "rgba(255,42,109,0.12)", border: "rgba(255,42,109,0.3)" },
  Tech:    { text: "#05D9E8", bg: "rgba(5,217,232,0.10)", border: "rgba(5,217,232,0.3)" },
  Story:   { text: "#FF7B00", bg: "rgba(255,123,0,0.10)", border: "rgba(255,123,0,0.3)" },
  Media:   { text: "#A855F7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.3)" },
  World:   { text: "#22C55E", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.3)" },
  Markets: { text: "#EAB308", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.3)" },
};

/* ─── tiny styled helpers ─── */
const Label = ({ children }) => (
  <p style={{
    fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
    color: "#52525b", fontWeight: 700, marginBottom: 6
  }}>{children}</p>
);

const Input = ({ style, ...props }) => (
  <input {...props} style={{
    width: "100%", background: "#0d0d10", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4, padding: "8px 12px", fontSize: 12, color: "#e4e4e7",
    fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
    ...style
  }}
  onFocus={e => e.target.style.borderColor = "#FF2A6D"}
  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
  />
);

const Textarea = ({ style, ...props }) => (
  <textarea {...props} style={{
    width: "100%", background: "#0d0d10", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4, padding: "8px 12px", fontSize: 12, color: "#e4e4e7",
    fontFamily: "inherit", outline: "none", resize: "vertical", transition: "border-color 0.2s",
    ...style
  }}
  onFocus={e => e.target.style.borderColor = "#05D9E8"}
  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
  />
);

export default function EditorialDesk() {
  const [ingestToken, setIngestToken]   = useState("");
  const [groqKey,     setGroqKey]       = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError,   setAuthError]     = useState("");
  const [bootLine,    setBootLine]      = useState(0);

  const [articles,        setArticles]        = useState([]);
  const [searchQuery,     setSearchQuery]      = useState("");
  const [categoryFilter,  setCategoryFilter]   = useState("all");
  const [feedLoading,     setFeedLoading]      = useState(false);

  const [activeArticle, setActiveArticle] = useState(null);
  const [activeTab,     setActiveTab]     = useState("metadata");

  const [rawText,    setRawText]    = useState("");
  const [groqModel,  setGroqModel]  = useState("llama3-70b-8192");
  const [groqLoading,setGroqLoading]= useState(false);
  const [groqLog,    setGroqLog]    = useState([]);

  const [toast, setToast] = useState(null);

  /* ── boot sequence lines ── */
  const BOOT = [
    "LEONIDA VICE EDITORIAL SYSTEM v3.0",
    "Initializing secure keychain...",
    "Verifying ingest token signature...",
    "Loading Groq AI proxy bridge...",
    "MongoDB connection established.",
    "⬛ AWAITING CREDENTIALS",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("ingest_token") || "";
    const savedG = localStorage.getItem("groq_api_key") || "";
    if (saved && savedG) {
      setIngestToken(saved); setGroqKey(savedG); setIsAuthorized(true);
    } else {
      let i = 0;
      const iv = setInterval(() => {
        setBootLine(prev => prev + 1);
        i++;
        if (i >= BOOT.length) clearInterval(iv);
      }, 320);
      return () => clearInterval(iv);
    }
  }, []); // eslint-disable-line

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchFeed = useCallback(async () => {
    if (!isAuthorized) return;
    setFeedLoading(true);
    try {
      const res = await api.listArticles({ limit: 100 });
      if (res?.items) setArticles(res.items);
      else setArticles([]);
    } catch (e) {
      showToast("error", `Feed error: ${e.message}`);
    } finally {
      setFeedLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => { if (isAuthorized) fetchFeed(); }, [isAuthorized]); // eslint-disable-line

  const handleLogin = e => {
    e.preventDefault();
    if (!ingestToken.trim()) return setAuthError("Ingest Token required.");
    if (!groqKey.trim())     return setAuthError("Groq API Key required.");
    localStorage.setItem("ingest_token",  ingestToken.trim());
    localStorage.setItem("groq_api_key",  groqKey.trim());
    setIsAuthorized(true); setAuthError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("ingest_token");
    localStorage.removeItem("groq_api_key");
    setIngestToken(""); setGroqKey(""); setIsAuthorized(false);
    setActiveArticle(null); setArticles([]);
  };

  const handleCreateNew = () => {
    const d = new Date();
    setActiveArticle({
      slug: `new-article-${Date.now()}`, title: "Untitled Editorial", dek: "",
      category: "Tech", author: "Editorial Desk",
      date: d.toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }),
      readTime: "5 min read",
      heroImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2400",
      tags: [], newsValueScore: 50,
      body: [
        { type:"lead", text:"Enter your lead paragraph here." },
        { type:"p",    text:"Standard paragraph content." },
      ]
    });
    setRawText(""); setActiveTab("metadata");
  };

  const handleDelete = async (slug, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${slug}"?`)) return;
    try {
      await api.deleteArticle(slug, ingestToken);
      showToast("success", `Deleted "${slug}"`);
      if (activeArticle?.slug === slug) setActiveArticle(null);
      fetchFeed();
    } catch (e) { showToast("error", `Delete failed: ${e.message}`); }
  };

  const handleTriggerGroq = async () => {
    if (!rawText.trim()) return showToast("error", "Paste raw text first.");
    setGroqLoading(true);
    setGroqLog(["▶ Connecting to Groq API...", `▶ Model: ${groqModel}`]);
    try {
      setGroqLog(p => [...p, "▶ Sending payload..."]);
      const data = await api.parseArticle(rawText, ingestToken, groqKey, groqModel);
      setGroqLog(p => [...p, "✔ Response received.", "✔ Parsing block schema...", "✔ Done!"]);
      const slug = data.slug || activeArticle?.slug || slugify(data.title || "groq-article");
      setActiveArticle(prev => ({
        ...(prev || {}), slug,
        title:          data.title || "Groq AI Article",
        dek:            data.dek || data.excerpt || "",
        category:       data.category || prev?.category || "Tech",
        author:         data.author || "Editorial Desk",
        date:           data.date || new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),
        readTime:       data.readTime || `${Math.ceil(rawText.split(" ").length / 200)} min read`,
        heroImage:      data.heroImage || prev?.heroImage || fallbackThumb(0),
        tags:           data.tags || [],
        newsValueScore: data.newsValueScore ?? 75,
        body:           data.body?.length ? data.body : [{ type:"lead", text: data.dek || "Parsed article." }],
      }));
      showToast("success", "AI parse complete!"); setActiveTab("metadata");
    } catch (e) {
      setGroqLog(p => [...p, `✘ Error: ${e.message}`]);
      showToast("error", `Groq failed: ${e.message}`);
    } finally { setGroqLoading(false); }
  };

  const handlePublish = async () => {
    if (!activeArticle?.slug?.trim()) return showToast("error", "Slug required.");
    if (!activeArticle?.title?.trim()) return showToast("error", "Title required.");
    try {
      await api.ingestArticles(activeArticle, ingestToken);
      showToast("success", `"${activeArticle.title}" published!`);
      fetchFeed();
    } catch (e) { showToast("error", `Publish failed: ${e.message}`); }
  };

  const updateMeta = (field, val) => setActiveArticle(p => p ? { ...p, [field]: val } : null);
  const updateBlock = (i, field, val) => setActiveArticle(p => {
    if (!p) return null;
    const b = [...p.body]; b[i] = { ...b[i], [field]: val };
    return { ...p, body: b };
  });
  const removeBlock = i => setActiveArticle(p => p ? { ...p, body: p.body.filter((_,idx) => idx !== i) } : null);
  const moveBlock = (i, dir) => setActiveArticle(p => {
    if (!p) return null;
    const b = [...p.body]; const t = i + dir;
    if (t < 0 || t >= b.length) return p;
    [b[i], b[t]] = [b[t], b[i]]; return { ...p, body: b };
  });
  const addBlock = type => setActiveArticle(p => {
    if (!p) return null;
    const nb = type === "image"
      ? { type, src:"https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2400", caption:"ENTER CAPTION" }
      : { type, text:"" };
    return { ...p, body: [...p.body, nb] };
  });

  const filtered = articles.filter(a => {
    const qs = searchQuery.toLowerCase();
    return (
      (!qs || (a.title||"").toLowerCase().includes(qs) || (a.slug||"").includes(qs)) &&
      (categoryFilter === "all" || a.category === categoryFilter)
    );
  });

  const hotCount   = articles.filter(a => (a.newsValueScore||0) >= 70).length;
  const draftCount = articles.filter(a => !a.body || a.body.length === 0).length;

  /* ═══════════════════════ LOCK SCREEN ═══════════════════════ */
  if (!isAuthorized) {
    return (
      <div style={{
        minHeight:"100vh", background:"#030305", display:"flex",
        alignItems:"center", justifyContent:"center", padding:24,
        position:"relative", overflow:"hidden"
      }}>
        {/* CRT scanline overlay */}
        <div style={{
          position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
          backgroundImage:"repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)",
        }}/>
        {/* Grid bg */}
        <div style={{
          position:"absolute", inset:0, zIndex:0, opacity:0.04,
          backgroundImage:"linear-gradient(rgba(5,217,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(5,217,232,1) 1px, transparent 1px)",
          backgroundSize:"40px 40px"
        }}/>
        {/* Glow */}
        <div style={{
          position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
          width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(255,42,109,0.06) 0%, transparent 70%)",
          pointerEvents:"none", zIndex:0
        }}/>

        <div style={{
          position:"relative", zIndex:1, width:"100%", maxWidth:480,
          background:"rgba(8,8,12,0.97)", border:"1px solid rgba(5,217,232,0.2)",
          borderRadius:8, padding:40, boxShadow:"0 0 60px rgba(255,42,109,0.08), 0 0 120px rgba(5,217,232,0.04)"
        }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:12 }}>
              <Terminal size={18} style={{ color:"#05D9E8" }}/>
              <span style={{ fontSize:10, letterSpacing:"0.4em", textTransform:"uppercase", color:"#05D9E8", fontWeight:700 }}>
                SECURE TERMINAL
              </span>
            </div>
            <h1 style={{
              fontSize:32, fontWeight:900, letterSpacing:"0.06em",
              background:"linear-gradient(90deg, #FF2A6D 0%, #FF7B00 60%, #05D9E8 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              marginBottom:4
            }}>LEONIDA VICE</h1>
            <p style={{ fontSize:10, letterSpacing:"0.3em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
              Editorial Command Center
            </p>
          </div>

          {/* Boot log */}
          <div style={{
            background:"#020204", border:"1px solid rgba(5,217,232,0.1)", borderRadius:4,
            padding:"12px 16px", marginBottom:24, minHeight:120, fontFamily:"monospace"
          }}>
            {BOOT.slice(0, bootLine).map((line, i) => (
              <div key={i} style={{
                fontSize:11, color: i === bootLine - 1 ? "#05D9E8" : "rgba(5,217,232,0.45)",
                lineHeight:"1.8", display:"flex", alignItems:"center", gap:8
              }}>
                <span style={{ color:"rgba(5,217,232,0.3)" }}>$</span> {line}
              </div>
            ))}
            {bootLine > 0 && bootLine < BOOT.length && (
              <span style={{ display:"inline-block", width:7, height:14, background:"#05D9E8", marginLeft:4, animation:"blink 1s step-end infinite" }}/>
            )}
          </div>

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <Label>Ingest Token (Access Code)</Label>
              <div style={{ position:"relative" }}>
                <Input type="password" placeholder="Bearer ey..." value={ingestToken}
                  onChange={e => setIngestToken(e.target.value)}
                  style={{ paddingRight:40, fontFamily:"monospace" }}/>
                <Key size={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#52525b" }}/>
              </div>
            </div>
            <div>
              <Label>Groq AI API Key</Label>
              <div style={{ position:"relative" }}>
                <Input type="password" placeholder="gsk_..." value={groqKey}
                  onChange={e => setGroqKey(e.target.value)}
                  style={{ paddingRight:40, fontFamily:"monospace" }}/>
                <Lock size={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#52525b" }}/>
              </div>
            </div>

            {authError && (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:4 }}>
                <AlertTriangle size={13} style={{ color:"#EF4444", flexShrink:0 }}/>
                <span style={{ fontSize:12, color:"#EF4444" }}>{authError}</span>
              </div>
            )}

            <button type="submit" style={{
              width:"100%", padding:"14px 0",
              background:"linear-gradient(90deg, #FF2A6D, #FF7B00)",
              border:"none", borderRadius:4, color:"#fff",
              fontWeight:700, fontSize:11, letterSpacing:"0.3em",
              textTransform:"uppercase", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 24px rgba(255,42,109,0.3)"
            }}>
              <Unlock size={14}/> Decrypt Desk
            </button>
          </form>

          <p style={{ marginTop:20, textAlign:"center", fontSize:9, letterSpacing:"0.2em", color:"#3f3f46", textTransform:"uppercase" }}>
            Keys stored only in your browser. Never sent to server.
          </p>
        </div>

        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    );
  }

  /* ═══════════════════════ MAIN WORKSPACE ═══════════════════════ */
  return (
    <div style={{
      minHeight:"100vh", background:"#030305", color:"#e4e4e7",
      fontFamily:"'Inter', sans-serif", paddingTop:112,
      display:"flex", flexDirection:"column"
    }}>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          display:"flex", alignItems:"center", gap:10, padding:"12px 20px",
          background:"#0d0d10", borderRadius:6, boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
          border: toast.type === "success" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)"
        }}>
          {toast.type === "success"
            ? <CheckCircle size={16} style={{ color:"#22C55E" }}/>
            : <AlertTriangle size={16} style={{ color:"#EF4444" }}/>
          }
          <span style={{ fontSize:13, fontWeight:600, color: toast.type === "success" ? "#22C55E" : "#EF4444" }}>
            {toast.text}
          </span>
        </div>
      )}

      {/* ── Top Command Bar ── */}
      <div style={{
        borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(5,5,8,0.98)",
        backdropFilter:"blur(20px)", padding:"0 24px", height:52,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
        position:"sticky", top:0, zIndex:40
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{
            fontSize:14, fontWeight:900, letterSpacing:"0.12em",
            background:"linear-gradient(90deg, #FF2A6D, #05D9E8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
          }}>EDITORIAL DESK</span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)" }}/>
          {/* Live stats */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", boxShadow:"0 0 6px #22C55E" }}/>
            <span style={{ fontSize:10, letterSpacing:"0.2em", color:"#52525b", textTransform:"uppercase" }}>
              {articles.length} articles
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <Zap size={10} style={{ color:"#FF7B00" }}/>
            <span style={{ fontSize:10, color:"#FF7B00", fontWeight:700 }}>{hotCount} HOT</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <Radio size={10} style={{ color:"#05D9E8" }}/>
            <span style={{ fontSize:10, color:"#52525b" }}>{draftCount} drafts</span>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={fetchFeed} disabled={feedLoading} title="Refresh" style={{
            padding:"6px 8px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:4, color:"#71717a", cursor:"pointer", display:"flex", alignItems:"center"
          }}>
            <RefreshCw size={13} style={{ animation: feedLoading ? "spin 0.8s linear infinite" : "none" }}/>
          </button>
          <button onClick={handleCreateNew} style={{
            padding:"6px 14px", background:"rgba(255,42,109,0.15)", border:"1px solid rgba(255,42,109,0.3)",
            borderRadius:4, color:"#FF2A6D", cursor:"pointer", fontSize:11, fontWeight:700,
            letterSpacing:"0.15em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6
          }}>
            <Plus size={12}/> Compose New
          </button>
          <button onClick={handleLogout} style={{
            padding:"6px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:4, color:"#EF4444", cursor:"pointer", fontSize:11, fontWeight:600,
            display:"flex", alignItems:"center", gap:6
          }}>
            <LogOut size={12}/> Lock
          </button>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div style={{
        display:"grid", gridTemplateColumns:"280px 1fr 380px",
        flex:1, height:"calc(100vh - 164px)", overflow:"hidden"
      }}>

        {/* ══ PANE 1: ARTICLE FEED ══ */}
        <div style={{
          borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column",
          background:"rgba(5,5,8,0.7)", overflow:"hidden"
        }}>
          {/* Search + filter */}
          <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ position:"relative", marginBottom:8 }}>
              <Search size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#52525b" }}/>
              <input type="text" placeholder="Search articles..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width:"100%", background:"#0d0d10", border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:4, padding:"7px 10px 7px 30px", fontSize:11, color:"#a1a1aa",
                  outline:"none", fontFamily:"inherit", boxSizing:"border-box"
                }}
              />
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["all", ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                  padding:"3px 10px", borderRadius:3, fontSize:9, fontWeight:700,
                  letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer",
                  border: categoryFilter === cat ? `1px solid ${CATEGORY_COLOR[cat]?.border || "rgba(255,42,109,0.4)"}` : "1px solid rgba(255,255,255,0.07)",
                  background: categoryFilter === cat ? (CATEGORY_COLOR[cat]?.bg || "rgba(255,42,109,0.12)") : "transparent",
                  color: categoryFilter === cat ? (CATEGORY_COLOR[cat]?.text || "#FF2A6D") : "#52525b",
                }}>
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Article list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {feedLoading ? (
              <div style={{ padding:32, textAlign:"center" }}>
                <Database size={20} style={{ color:"#27272a", margin:"0 auto 10px" }}/>
                <p style={{ fontSize:10, letterSpacing:"0.25em", color:"#3f3f46", textTransform:"uppercase" }}>
                  Accessing database...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:32, textAlign:"center" }}>
                <Globe size={20} style={{ color:"#27272a", margin:"0 auto 10px" }}/>
                <p style={{ fontSize:10, letterSpacing:"0.2em", color:"#3f3f46", textTransform:"uppercase" }}>
                  {searchQuery ? "No matches" : "No articles indexed"}
                </p>
                {!searchQuery && (
                  <p style={{ fontSize:10, color:"#27272a", marginTop:8, lineHeight:1.6 }}>
                    Your backend API URL is not configured in Vercel.<br/>
                    Set <code style={{ color:"#FF7B00" }}>REACT_APP_BACKEND_URL</code> in Vercel env vars.
                  </p>
                )}
              </div>
            ) : (
              filtered.map(art => {
                const isSelected = activeArticle?.slug === art.slug;
                const isDraft    = !art.body || art.body.length === 0;
                const isHot      = (art.newsValueScore || 0) >= 70;
                const catColor   = CATEGORY_COLOR[art.category] || CATEGORY_COLOR.Tech;

                return (
                  <div key={art.slug}
                    onClick={() => { setActiveArticle(art); setRawText(art.aiSummary || art.excerpt || ""); }}
                    style={{
                      padding:"12px 14px", cursor:"pointer", position:"relative",
                      borderBottom:"1px solid rgba(255,255,255,0.04)",
                      borderLeft: isSelected ? "2px solid #05D9E8" : "2px solid transparent",
                      background: isSelected ? "rgba(5,217,232,0.04)" : "transparent",
                      transition:"background 0.15s"
                    }}
                  >
                    {/* Category + time */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                      <span style={{
                        fontSize:8, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase",
                        color: catColor.text, background: catColor.bg,
                        border: `1px solid ${catColor.border}`,
                        padding:"1px 7px", borderRadius:2
                      }}>{art.category || "—"}</span>
                      {isHot && <span style={{ fontSize:9, color:"#FF7B00" }}>🔥</span>}
                      <span style={{ fontSize:9, color:"#3f3f46", marginLeft:"auto" }}>
                        {timeAgo(art.publishedAt || art.scrapedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <p style={{
                      fontSize:12, fontWeight:600, color: isSelected ? "#fff" : "#a1a1aa",
                      lineHeight:1.4, marginBottom:6,
                      display:"-webkit-box", WebkitLineClamp:2,
                      WebkitBoxOrient:"vertical", overflow:"hidden"
                    }}>{art.title}</p>

                    {/* Bottom row */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{
                          fontSize:8, fontWeight:700, letterSpacing:"0.15em",
                          padding:"2px 8px", borderRadius:2,
                          background: isDraft ? "rgba(5,217,232,0.08)" : "rgba(34,197,94,0.08)",
                          border: isDraft ? "1px solid rgba(5,217,232,0.2)" : "1px solid rgba(34,197,94,0.2)",
                          color: isDraft ? "#05D9E8" : "#22C55E", textTransform:"uppercase"
                        }}>{isDraft ? "DRAFT" : "LIVE"}</span>
                        {art.newsValueScore !== undefined && (
                          <span style={{ fontSize:9, color:"#52525b" }}>Score: {art.newsValueScore}</span>
                        )}
                      </div>
                      <button
                        onClick={e => handleDelete(art.slug, e)}
                        style={{
                          background:"transparent", border:"none", cursor:"pointer",
                          color:"#3f3f46", padding:4, borderRadius:3, display:"flex",
                          opacity: isSelected ? 1 : 0, transition:"opacity 0.2s"
                        }}
                        onMouseOver={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseOut={e => e.currentTarget.style.color = "#3f3f46"}
                      >
                        <Trash2 size={11}/>
                      </button>
                    </div>
                    <ChevronRight size={10} style={{
                      position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                      color: isSelected ? "#05D9E8" : "transparent"
                    }}/>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══ PANE 2: EDITOR ══ */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden", background:"#030305" }}>
          {!activeArticle ? (
            <div style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              textAlign:"center", padding:48
            }}>
              <Activity size={40} style={{ color:"#1c1c1f", marginBottom:16 }}/>
              <h2 style={{ fontSize:16, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:"#3f3f46", marginBottom:8 }}>
                Editorial Work Console
              </h2>
              <p style={{ fontSize:12, color:"#27272a", maxWidth:300, lineHeight:1.7 }}>
                Select an article from the feed or compose a new one to load the block editor.
              </p>
              <button onClick={handleCreateNew} style={{
                marginTop:24, padding:"10px 24px", background:"rgba(255,42,109,0.1)",
                border:"1px solid rgba(255,42,109,0.25)", borderRadius:4, color:"#FF2A6D",
                fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase",
                cursor:"pointer"
              }}>+ Start Blank Page</button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{
                display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)",
                background:"rgba(5,5,8,0.9)", flexShrink:0
              }}>
                {[
                  { id:"metadata", label:"Metadata", color:"#05D9E8" },
                  { id:"blocks",   label:`Blocks (${activeArticle.body?.length||0})`, color:"#FF2A6D" },
                  { id:"groq",     label:"Groq AI Parser", color:"#FF7B00", icon:<Sparkles size={10}/> },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    flex:1, padding:"12px 8px", fontSize:10, fontWeight:700,
                    letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer",
                    background:"transparent", border:"none",
                    borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : "2px solid transparent",
                    color: activeTab === tab.id ? "#fff" : "#52525b",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                    transition:"color 0.2s"
                  }}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex:1, overflowY:"auto", padding:20 }}>

                {/* ─── METADATA TAB ─── */}
                {activeTab === "metadata" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <div>
                      <Label>Article Title</Label>
                      <Input value={activeArticle.title} onChange={e => {
                        updateMeta("title", e.target.value);
                        if (activeArticle.slug.startsWith("new-article-")) updateMeta("slug", slugify(e.target.value));
                      }}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <Label>URL Slug</Label>
                        <Input value={activeArticle.slug} onChange={e => updateMeta("slug", slugify(e.target.value))}
                          style={{ fontFamily:"monospace", fontSize:11 }}/>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <select value={activeArticle.category} onChange={e => updateMeta("category", e.target.value)}
                          style={{
                            width:"100%", background:"#0d0d10", border:"1px solid rgba(255,255,255,0.08)",
                            borderRadius:4, padding:"8px 12px", fontSize:12, color:"#a1a1aa", outline:"none"
                          }}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Standfirst / Dek</Label>
                      <Textarea rows={3} value={activeArticle.dek||""} onChange={e => updateMeta("dek", e.target.value)}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                      <div><Label>Author</Label><Input value={activeArticle.author||""} onChange={e => updateMeta("author", e.target.value)}/></div>
                      <div><Label>Date</Label><Input value={activeArticle.date||""} onChange={e => updateMeta("date", e.target.value)}/></div>
                      <div><Label>Read Time</Label><Input value={activeArticle.readTime||""} onChange={e => updateMeta("readTime", e.target.value)}/></div>
                    </div>
                    <div>
                      <Label>Hero Image URL</Label>
                      <Input value={activeArticle.heroImage||""} onChange={e => updateMeta("heroImage", e.target.value)}
                        style={{ fontFamily:"monospace", fontSize:11 }}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <Label>News Value Score — {activeArticle.newsValueScore||50} {(activeArticle.newsValueScore||0)>=70 ? "🔥 HOT" : ""}</Label>
                        <input type="range" min={0} max={100} value={activeArticle.newsValueScore||50}
                          onChange={e => updateMeta("newsValueScore", parseInt(e.target.value))}
                          style={{ width:"100%", accentColor:"#FF2A6D", cursor:"pointer" }}/>
                      </div>
                      <div>
                        <Label>Tags (comma-separated)</Label>
                        <Input value={(activeArticle.tags||[]).join(", ")}
                          onChange={e => updateMeta("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}/>
                      </div>
                    </div>
                    {activeArticle.sourceUrl && (
                      <a href={activeArticle.sourceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:11, color:"#05D9E8", textDecoration:"none" }}>
                        ↗ View Original Source
                      </a>
                    )}
                  </div>
                )}

                {/* ─── BLOCKS TAB ─── */}
                {activeTab === "blocks" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {/* Add block bar */}
                    <div style={{
                      padding:"10px 14px", background:"rgba(255,255,255,0.02)",
                      border:"1px solid rgba(255,255,255,0.07)", borderRadius:4,
                      display:"flex", flexWrap:"wrap", alignItems:"center", gap:8
                    }}>
                      <span style={{ fontSize:9, letterSpacing:"0.2em", color:"#52525b", textTransform:"uppercase", fontWeight:700 }}>Add Block:</span>
                      {[
                        { type:"lead",  label:"Lead ¶",   color:"#FF2A6D" },
                        { type:"p",     label:"Paragraph", color:"#71717a" },
                        { type:"h2",    label:"Heading",   color:"#05D9E8" },
                        { type:"pull",  label:"Pullquote", color:"#FF7B00" },
                        { type:"image", label:"Image",     color:"#A855F7" },
                      ].map(b => (
                        <button key={b.type} onClick={() => addBlock(b.type)} style={{
                          padding:"4px 12px", fontSize:9, fontWeight:700, letterSpacing:"0.1em",
                          textTransform:"uppercase", cursor:"pointer", borderRadius:3,
                          background:`rgba(${b.color === "#FF2A6D"?"255,42,109":b.color === "#05D9E8"?"5,217,232":b.color === "#FF7B00"?"255,123,0":b.color === "#A855F7"?"168,85,247":"113,113,122"},0.1)`,
                          border:`1px solid ${b.color}33`, color:b.color
                        }}>+ {b.label}</button>
                      ))}
                    </div>

                    {/* Blocks */}
                    {(!activeArticle.body || activeArticle.body.length === 0) ? (
                      <div style={{
                        padding:32, textAlign:"center", border:"1px dashed rgba(255,255,255,0.08)",
                        borderRadius:4, fontSize:11, color:"#3f3f46", textTransform:"uppercase", letterSpacing:"0.2em"
                      }}>No blocks yet</div>
                    ) : activeArticle.body.map((block, i) => {
                      const colors = { lead:"#FF2A6D", p:"#71717a", h2:"#05D9E8", pull:"#FF7B00", image:"#A855F7" };
                      const c = colors[block.type] || "#71717a";
                      return (
                        <div key={i} style={{
                          padding:14, borderRadius:4, background:`${c}08`,
                          border:`1px solid ${c}22`
                        }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:9, color:"#3f3f46", fontFamily:"monospace" }}>#{String(i+1).padStart(2,"0")}</span>
                              <span style={{
                                fontSize:8, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase",
                                color:c, background:`${c}15`, padding:"2px 8px", borderRadius:2
                              }}>{block.type === "lead" ? "Lead Drop-cap" : block.type}</span>
                            </div>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => moveBlock(i,-1)} disabled={i===0} style={{
                                background:"transparent", border:"none", cursor:"pointer", color:"#52525b",
                                opacity: i===0 ? 0.3 : 1, padding:4
                              }}><ArrowUp size={11}/></button>
                              <button onClick={() => moveBlock(i,1)} disabled={i===activeArticle.body.length-1} style={{
                                background:"transparent", border:"none", cursor:"pointer", color:"#52525b",
                                opacity: i===activeArticle.body.length-1 ? 0.3 : 1, padding:4
                              }}><ArrowDown size={11}/></button>
                              <button onClick={() => removeBlock(i)} style={{
                                background:"transparent", border:"none", cursor:"pointer", color:"#52525b", padding:4
                              }} onMouseOver={e=>e.currentTarget.style.color="#EF4444"}
                                 onMouseOut={e=>e.currentTarget.style.color="#52525b"}
                              ><X size={11}/></button>
                            </div>
                          </div>
                          {block.type === "image" ? (
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              <div><Label>Image URL</Label>
                                <Input value={block.src||""} onChange={e => updateBlock(i,"src",e.target.value)}
                                  style={{ fontFamily:"monospace", fontSize:10 }}/>
                              </div>
                              <div><Label>Caption (Uppercase)</Label>
                                <Input value={block.caption||""} onChange={e => updateBlock(i,"caption",e.target.value)}/>
                              </div>
                            </div>
                          ) : (
                            <Textarea rows={block.type==="lead"?4:3} value={block.text||""}
                              onChange={e => updateBlock(i,"text",e.target.value)}
                              placeholder={`Enter ${block.type} content...`}/>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── GROQ TAB ─── */}
                {activeTab === "groq" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <div style={{
                      padding:"12px 16px", background:"rgba(255,123,0,0.06)",
                      border:"1px solid rgba(255,123,0,0.2)", borderRadius:4
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <Sparkles size={13} style={{ color:"#FF7B00" }}/>
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"#FF7B00", textTransform:"uppercase" }}>Groq AI Dynamic Layout Parser</span>
                      </div>
                      <p style={{ fontSize:11, color:"#71717a", lineHeight:1.7 }}>
                        Paste raw scraped article text. The AI will extract, rewrite, and structure it into premium editorial layout blocks instantly.
                      </p>
                    </div>

                    <div>
                      <Label>Raw Scraped Content</Label>
                      <Textarea rows={12} value={rawText} onChange={e => setRawText(e.target.value)}
                        placeholder="Paste raw scraped text here..."
                        style={{ fontSize:11, lineHeight:1.8, fontFamily:"monospace" }}/>
                    </div>

                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                      <div>
                        <Label>AI Model</Label>
                        <select value={groqModel} onChange={e => setGroqModel(e.target.value)} style={{
                          background:"#0d0d10", border:"1px solid rgba(255,255,255,0.08)",
                          borderRadius:4, padding:"7px 12px", fontSize:11, color:"#a1a1aa", outline:"none"
                        }}>
                          <option value="llama3-70b-8192">Llama 3 70B — Recommended</option>
                          <option value="llama3-8b-8192">Llama 3 8B — Faster</option>
                          <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                          <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                        </select>
                      </div>
                      <button onClick={handleTriggerGroq} disabled={groqLoading} style={{
                        padding:"10px 24px",
                        background: groqLoading ? "rgba(255,123,0,0.1)" : "linear-gradient(90deg, #FF7B00, #FF2A6D)",
                        border:"none", borderRadius:4, color:"#fff", fontWeight:700,
                        fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase",
                        cursor: groqLoading ? "not-allowed" : "pointer",
                        display:"flex", alignItems:"center", gap:8, opacity: groqLoading ? 0.7 : 1,
                        boxShadow: groqLoading ? "none" : "0 4px 20px rgba(255,123,0,0.3)"
                      }}>
                        {groqLoading
                          ? <><RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/> Parsing...</>
                          : <><Sparkles size={12}/> Summarize &amp; Layout</>
                        }
                      </button>
                    </div>

                    {/* Groq terminal log */}
                    {groqLog.length > 0 && (
                      <div style={{
                        background:"#020204", border:"1px solid rgba(5,217,232,0.1)",
                        borderRadius:4, padding:"12px 16px", fontFamily:"monospace"
                      }}>
                        {groqLog.map((line, i) => (
                          <div key={i} style={{
                            fontSize:11, lineHeight:1.9,
                            color: line.startsWith("✔") ? "#22C55E" : line.startsWith("✘") ? "#EF4444" : "#05D9E8"
                          }}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Publish bar */}
              <div style={{
                borderTop:"1px solid rgba(255,255,255,0.06)", padding:"12px 20px",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"rgba(5,5,8,0.95)", flexShrink:0
              }}>
                <button onClick={() => handleDelete(activeArticle.slug)} style={{
                  padding:"8px 16px", background:"rgba(239,68,68,0.08)",
                  border:"1px solid rgba(239,68,68,0.2)", borderRadius:4,
                  color:"#EF4444", fontSize:10, fontWeight:700, letterSpacing:"0.15em",
                  textTransform:"uppercase", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:6
                }}>
                  <Trash2 size={12}/> Delete
                </button>
                <button onClick={handlePublish} style={{
                  padding:"10px 28px",
                  background:"linear-gradient(90deg, #FF2A6D, #FF7B00)",
                  border:"none", borderRadius:4, color:"#fff", fontWeight:700,
                  fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                  boxShadow:"0 4px 20px rgba(255,42,109,0.3)"
                }}>
                  <Save size={12}/> Publish &amp; Sync Live
                </button>
              </div>
            </>
          )}
        </div>

        {/* ══ PANE 3: LIVE PREVIEW ══ */}
        <div style={{
          borderLeft:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column",
          background:"#04040a", overflow:"hidden"
        }}>
          <div style={{
            padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"rgba(5,5,8,0.9)"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Eye size={12} style={{ color:"#05D9E8" }}/>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.3em", color:"#05D9E8", textTransform:"uppercase" }}>
                Cinematic Live Preview
              </span>
            </div>
            <span style={{ fontSize:8, color:"#27272a", letterSpacing:"0.15em", textTransform:"uppercase" }}>Leonida Vice Template</span>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:24, background:"#04040a" }}>
            {!activeArticle ? (
              <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <p style={{ fontSize:10, color:"#27272a", letterSpacing:"0.2em", textTransform:"uppercase" }}>No active article</p>
              </div>
            ) : (
              <div style={{ maxWidth:340, margin:"0 auto" }}>
                {/* Category badge */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  {(() => { const cc = CATEGORY_COLOR[activeArticle.category] || CATEGORY_COLOR.Tech; return (
                    <span style={{
                      fontSize:8, fontWeight:800, letterSpacing:"0.25em",
                      background: cc.text, color:"#fff", padding:"3px 10px",
                      textTransform:"uppercase"
                    }}>{activeArticle.category || "LEAKS"}</span>
                  );})()}
                  <span style={{ fontSize:8, color:"#27272a", letterSpacing:"0.2em", textTransform:"uppercase" }}>
                    № — LIVE EDIT
                  </span>
                </div>

                {/* Title */}
                <h1 style={{
                  fontSize:22, fontWeight:900, lineHeight:1.2, color:"#fff",
                  letterSpacing:"-0.01em", marginBottom:10
                }}>{activeArticle.title || "UNTITLED"}</h1>

                {/* Dek */}
                {activeArticle.dek && (
                  <p style={{
                    fontSize:13, fontStyle:"italic", color:"#a1a1aa",
                    lineHeight:1.6, borderBottom:"1px solid rgba(255,255,255,0.07)",
                    paddingBottom:12, marginBottom:12
                  }}>{activeArticle.dek}</p>
                )}

                {/* Byline */}
                <div style={{
                  display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
                  marginBottom:16, fontSize:9, color:"#52525b", letterSpacing:"0.15em",
                  textTransform:"uppercase"
                }}>
                  <span>By {activeArticle.author || "Editorial Desk"}</span>
                  <span style={{ width:3, height:3, borderRadius:"50%", background:"#3f3f46" }}/>
                  <span>{activeArticle.date || "Today"}</span>
                  <span style={{ width:3, height:3, borderRadius:"50%", background:"#3f3f46" }}/>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Clock size={9}/>{activeArticle.readTime || "5 min"}
                  </span>
                </div>

                {/* Hero image */}
                {activeArticle.heroImage && (
                  <div style={{
                    position:"relative", borderRadius:4, overflow:"hidden",
                    aspectRatio:"16/9", background:"#0d0d10", marginBottom:20,
                    border:"1px solid rgba(255,255,255,0.06)"
                  }}>
                    <img src={activeArticle.heroImage} alt="Hero"
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }}/>
                  </div>
                )}

                {/* Body blocks */}
                <div style={{ fontSize:13, lineHeight:1.8 }}>
                  {(activeArticle.body||[]).map((block, idx) => {
                    if (block.type === "lead") return (
                      <p key={idx} style={{
                        color:"#e4e4e7", fontWeight:500, marginBottom:14,
                        fontSize:14, lineHeight:1.7
                      }}>
                        <span style={{
                          float:"left", fontSize:52, lineHeight:0.85,
                          color:"#FF2A6D", fontWeight:900, marginRight:6, marginTop:6
                        }}>{(block.text||"")[0]}</span>
                        {(block.text||"").slice(1)}
                      </p>
                    );
                    if (block.type === "p") return (
                      <p key={idx} style={{ color:"#a1a1aa", marginBottom:12 }}>{block.text}</p>
                    );
                    if (block.type === "h2") return (
                      <h2 key={idx} style={{
                        fontSize:13, fontWeight:800, letterSpacing:"0.15em",
                        textTransform:"uppercase", color:"#fff",
                        borderLeft:"2px solid #FF2A6D", paddingLeft:10,
                        margin:"20px 0 10px"
                      }}>{block.text}</h2>
                    );
                    if (block.type === "pull") return (
                      <blockquote key={idx} style={{
                        borderTop:"1px solid rgba(255,255,255,0.08)",
                        borderBottom:"1px solid rgba(255,255,255,0.08)",
                        padding:"16px 0", margin:"20px 0", textAlign:"center"
                      }}>
                        <p style={{ fontSize:14, fontStyle:"italic", color:"#e4e4e7", lineHeight:1.5 }}>
                          "{block.text}"
                        </p>
                      </blockquote>
                    );
                    if (block.type === "image") return (
                      <figure key={idx} style={{ margin:"20px 0" }}>
                        {block.caption && (
                          <p style={{
                            fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase",
                            color:"#71717a", borderLeft:"2px solid #FF2A6D",
                            paddingLeft:10, marginBottom:8, fontWeight:700
                          }}>{block.caption}</p>
                        )}
                        <div style={{ borderRadius:4, overflow:"hidden", aspectRatio:"16/9", background:"#0d0d10" }}>
                          <img src={block.src} alt={block.caption||""} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        </div>
                      </figure>
                    );
                    return null;
                  })}
                </div>

                {/* Tags */}
                {activeArticle.tags?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:20, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    {activeArticle.tags.map(t => (
                      <span key={t} style={{
                        fontSize:8, letterSpacing:"0.15em", textTransform:"uppercase",
                        padding:"3px 10px", border:"1px solid rgba(255,255,255,0.1)",
                        borderRadius:2, color:"#71717a"
                      }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
    </div>
  );
}
