import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Unlock,
  Key,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  Edit3,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  X,
  PlusCircle,
  FileDown
} from "lucide-react";
import { api, timeAgo, fallbackThumb } from "../lib/api";
import { slugify } from "../components/ArticleTOC";

// Standard categories from design guidelines
const CATEGORIES = ["Leaks", "Tech", "Story", "Media", "World", "Markets"];

export default function EditorialDesk() {
  // Authentication states
  const [ingestToken, setIngestToken] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");

  // Feed/Article list states
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [feedLoading, setFeedLoading] = useState(false);

  // Selected article workspace state
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("metadata"); // "metadata" | "blocks" | "groq"
  
  // Custom paste raw text state
  const [rawText, setRawText] = useState("");
  const [groqModel, setGroqModel] = useState("llama3-70b-8192");
  const [groqLoading, setGroqLoading] = useState(false);
  
  // UI Toast & Action Status
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Load credentials on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("ingest_token") || "";
    const savedGroq = localStorage.getItem("groq_api_key") || "";
    if (savedToken && savedGroq) {
      setIngestToken(savedToken);
      setGroqKey(savedGroq);
      setIsAuthorized(true);
    }
  }, []);

  // Fetch articles from MongoDB
  useEffect(() => {
    const fetchFeed = async () => {
      if (!isAuthorized) return;
      setFeedLoading(true);
      try {
        const res = await api.listArticles({ limit: 50 });
        if (res && res.items) {
          setArticles(res.items);
        }
      } catch (e) {
        showStatus("error", `Failed to load feed: ${e.message}`);
      } finally {
        setFeedLoading(false);
      }
    };

    if (isAuthorized) {
      fetchFeed();
    }
  }, [isAuthorized]);

  // Show status toast helper
  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  // Credentials form submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (!ingestToken.trim()) {
      setAuthError("Ingest Token is required.");
      return;
    }
    if (!groqKey.trim()) {
      setAuthError("Groq API Key is required.");
      return;
    }

    localStorage.setItem("ingest_token", ingestToken.trim());
    localStorage.setItem("groq_api_key", groqKey.trim());
    setIsAuthorized(true);
    setAuthError("");
    showStatus("success", "Decryption keychain loaded. Workspace unlocked.");
  };

  // Sign out / Clear keychain
  const handleLogout = () => {
    localStorage.removeItem("ingest_token");
    localStorage.removeItem("groq_api_key");
    setIngestToken("");
    setGroqKey("");
    setIsAuthorized(false);
    setActiveArticle(null);
    setArticles([]);
    showStatus("success", "Keychain cleared. Workspace locked.");
  };

  // Create empty new article template
  const handleCreateNew = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    
    const newArt = {
      slug: `new-article-${Date.now()}`,
      title: "Untitled Editorial Article",
      dek: "Enter a brief, italicized summary of the article here.",
      category: "Tech",
      author: "Editorial Desk",
      date: formattedDate,
      readTime: "5 min read",
      heroImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2400",
      tags: ["Tech", "Leonida"],
      newsValueScore: 50,
      body: [
        { type: "lead", text: "This is the first lead paragraph. It will receive a stylized drop-cap on the site." },
        { type: "p", text: "Enter standard article paragraph content here." }
      ]
    };
    setActiveArticle(newArt);
    setActiveTab("metadata");
    setRawText("");
  };

  // Delete article from feed
  const handleDeleteArticle = async (slug, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete article "${slug}"?`)) {
      return;
    }

    try {
      await api.deleteArticle(slug, ingestToken);
      showStatus("success", `Article "${slug}" deleted successfully.`);
      if (activeArticle && activeArticle.slug === slug) {
        setActiveArticle(null);
      }
      fetchFeed();
    } catch (e) {
      showStatus("error", `Deletion failed: ${e.message}`);
    }
  };

  // Execute Groq AI re-summarization proxy
  const handleTriggerGroq = async () => {
    if (!rawText.trim()) {
      showStatus("error", "Please provide raw scraped article text to summarize.");
      return;
    }
    setGroqLoading(true);
    try {
      const data = await api.parseArticle(rawText, ingestToken, groqKey, groqModel);
      
      // Merge results with active article or generate a new one
      const generatedSlug = data.slug || activeArticle?.slug || slugify(data.title || "groq-article");
      const finalArticle = {
        ...(activeArticle || {}),
        slug: generatedSlug,
        title: data.title || "Groq AI Parsed Article",
        dek: data.dek || data.excerpt || "A refined AI-summarized update.",
        category: data.category || activeArticle?.category || "Tech",
        author: data.author || "Editorial Desk",
        date: data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        readTime: data.readTime || `${Math.ceil((rawText.split(" ").length) / 200)} min read`,
        heroImage: data.heroImage || activeArticle?.heroImage || "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2400",
        tags: data.tags || ["AI Scrape", data.category || "Tech"],
        newsValueScore: data.newsValueScore !== undefined ? data.newsValueScore : 75,
        body: data.body && data.body.length > 0 ? data.body : [
          { type: "lead", text: data.dek || "Summary lead paragraph." },
          { type: "p", text: "Prose content." }
        ]
      };
      
      setActiveArticle(finalArticle);
      showStatus("success", "AI parse completed. Dynamic block layout populated!");
      setActiveTab("metadata");
    } catch (e) {
      showStatus("error", `Groq AI Parsing Failed: ${e.message}`);
    } finally {
      setGroqLoading(false);
    }
  };

  // Save/Publish active article to Database
  const handlePublish = async () => {
    if (!activeArticle) return;
    if (!activeArticle.slug || !activeArticle.slug.trim()) {
      showStatus("error", "Slug is required to publish.");
      return;
    }
    if (!activeArticle.title || !activeArticle.title.trim()) {
      showStatus("error", "Title is required to publish.");
      return;
    }

    try {
      const res = await api.ingestArticles(activeArticle, ingestToken);
      showStatus("success", `Article "${activeArticle.title}" published & synced live!`);
      fetchFeed();
    } catch (e) {
      showStatus("error", `Publishing failed: ${e.message}`);
    }
  };

  // Helper to update active article metadata fields
  const updateMeta = (field, value) => {
    setActiveArticle(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Helpers for body blocks editing
  const updateBlock = (index, field, value) => {
    setActiveArticle(prev => {
      if (!prev) return null;
      const newBody = [...prev.body];
      newBody[index] = { ...newBody[index], [field]: value };
      return { ...prev, body: newBody };
    });
  };

  const removeBlock = (index) => {
    setActiveArticle(prev => {
      if (!prev) return null;
      const newBody = prev.body.filter((_, idx) => idx !== index);
      return { ...prev, body: newBody };
    });
  };

  const moveBlock = (index, direction) => {
    setActiveArticle(prev => {
      if (!prev) return null;
      const newBody = [...prev.body];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newBody.length) return prev;
      
      const temp = newBody[index];
      newBody[index] = newBody[targetIndex];
      newBody[targetIndex] = temp;
      return { ...prev, body: newBody };
    });
  };

  const addBlock = (type) => {
    setActiveArticle(prev => {
      if (!prev) return null;
      const newBlock = type === "image" 
        ? { type, src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2400", caption: "ENTER UPPERCASE CAPTION HERE" }
        : { type, text: "" };
      return { ...prev, body: [...prev.body, newBlock] };
    });
  };

  // Filtered article list
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (art.slug && art.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || art.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Render Login Lock Screen
  if (!isAuthorized) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 scanline vignette overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 w-full max-w-md bg-[#0a0a0c]/90 border border-white/10 p-8 rounded-xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <span
              className="font-display text-4xl tracking-[0.05em] block leading-none mb-2"
              style={{
                background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LEONIDA VICE
            </span>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#05D9E8] font-semibold">
              // SECURE EDITORIAL COMMAND
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-zinc-400 mb-2 font-semibold">
                Access Token (Ingest Token)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Bearer token"
                  value={ingestToken}
                  onChange={(e) => setIngestToken(e.target.value)}
                  className="w-full bg-[#121216] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#FF2A6D] focus:outline-none transition font-mono tracking-wider"
                />
                <Key className="absolute right-3.5 top-3 text-zinc-500" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-zinc-400 mb-2 font-semibold">
                Groq AI API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full bg-[#121216] border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-[#05D9E8] focus:outline-none transition font-mono tracking-wider"
                />
                <Lock className="absolute right-3.5 top-3 text-zinc-500" size={16} />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-xs">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF2A6D] to-[#FF7B00] hover:scale-[1.02] transition-transform text-white font-semibold tracking-[0.25em] text-xs uppercase py-4 rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              <Unlock size={14} /> Decrypt Desk
            </button>
          </form>

          <p className="mt-8 text-center text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            Keys are strictly saved in your browser localStorage. Never saved on database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white pt-28 min-h-screen font-body flex flex-col relative select-none">
      {/* Toast notifications */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border ${
          statusMessage.type === "success" 
            ? "bg-[#0A0A0C] border-emerald-500/40 text-emerald-400" 
            : "bg-[#0A0A0C] border-red-500/40 text-red-400"
        }`}>
          {statusMessage.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-semibold tracking-wide">{statusMessage.text}</span>
        </div>
      )}

      {/* Main workspace header grid */}
      <div className="border-b border-white/10 bg-[#0a0a0c] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-2xl tracking-[0.05em] bg-gradient-to-r from-[#FF2A6D] to-[#05D9E8] WebkitBackgroundClip: text WebkitTextFillColor: transparent" style={{ background: "linear-gradient(90deg, #FF2A6D 0%, #05D9E8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EDITORIAL DESK
          </span>
          <span className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Secure Ingest Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeed}
            disabled={feedLoading}
            className="p-2 border border-white/10 rounded bg-[#121216] hover:bg-zinc-800 transition text-zinc-300 disabled:opacity-50"
            title="Refresh Feed List"
          >
            <RefreshCw size={14} className={feedLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded bg-[#FF2A6D]/20 text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#FF2A6D]/30 transition"
          >
            <Plus size={14} /> Compose New
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-950/60 transition text-xs tracking-wider uppercase"
          >
            <LogOut size={14} /> Lock Desk
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden h-[calc(100vh-170px)]">
        {/* PANE 1: Sidebar Feed (xl:col-span-3) */}
        <div className="xl:col-span-3 border-r border-white/10 flex flex-col h-full bg-[#0a0a0c]/50">
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search database articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 pl-9 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
            </div>

            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#121216] border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#05D9E8] text-zinc-300 font-body"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {feedLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
                Accessing feeds...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-600 uppercase tracking-widest">
                No articles indexed
              </div>
            ) : (
              filteredArticles.map(art => {
                const isDraft = !art.body || art.body.length === 0;
                const isSelected = activeArticle && activeArticle.slug === art.slug;
                
                return (
                  <div
                    key={art.slug}
                    onClick={() => {
                      setActiveArticle(art);
                      setRawText(art.aiSummary || art.excerpt || "");
                    }}
                    className={`p-4 cursor-pointer transition flex items-start justify-between gap-3 group relative ${
                      isSelected ? "bg-white/[0.04] border-l-2 border-[#05D9E8]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-[#FF2A6D] font-bold">
                          {art.category || "General"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span className="text-[9px] text-zinc-500">
                          {timeAgo(art.publishedAt || art.scrapedAt)}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug group-hover:text-white transition">
                        {art.title}
                      </h4>

                      <div className="mt-2 flex items-center gap-2">
                        {isDraft ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-cyan-500/30 text-[#05D9E8] bg-cyan-950/20 uppercase tracking-wider font-semibold">
                            Draft Feed
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-pink-500/30 text-[#FF2A6D] bg-pink-950/20 uppercase tracking-wider font-semibold shadow-sm shadow-pink-500/10">
                            Published
                          </span>
                        )}
                        {art.newsValueScore >= 70 && (
                          <span className="text-[9px] font-semibold text-[#FF7B00]">🔥 HOT</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteArticle(art.slug, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: Workspace Editor (xl:col-span-5) */}
        <div className="xl:col-span-5 border-r border-white/10 flex flex-col h-full bg-[#050505]">
          {!activeArticle ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center scanline relative select-none">
              <FileText size={48} className="text-zinc-700 mb-4 animate-pulse" />
              <h3 className="font-display text-xl uppercase tracking-wider text-zinc-400">
                Editorial Work Console
              </h3>
              <p className="mt-2 text-xs text-zinc-500 max-w-sm leading-relaxed">
                Select an article from the database list, or compose a new article from scratch to load the block editor.
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-6 px-5 py-2.5 border border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-white/30 text-xs font-semibold tracking-widest uppercase transition rounded"
              >
                + Start Blank Page
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tabs header */}
              <div className="flex border-b border-white/10 bg-[#0a0a0c] text-xs">
                <button
                  onClick={() => setActiveTab("metadata")}
                  className={`flex-1 py-3 px-4 text-center font-semibold tracking-wider uppercase border-b-2 transition ${
                    activeTab === "metadata" 
                      ? "border-[#05D9E8] text-white bg-white/[0.02]" 
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  1. Metadata Settings
                </button>
                <button
                  onClick={() => setActiveTab("blocks")}
                  className={`flex-1 py-3 px-4 text-center font-semibold tracking-wider uppercase border-b-2 transition ${
                    activeTab === "blocks" 
                      ? "border-[#FF2A6D] text-white bg-white/[0.02]" 
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  2. Layout Blocks ({activeArticle.body?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("groq")}
                  className={`flex-1 py-3 px-4 text-center font-semibold tracking-wider uppercase border-b-2 transition flex items-center justify-center gap-1.5 ${
                    activeTab === "groq" 
                      ? "border-[#FF7B00] text-white bg-white/[0.02]" 
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sparkles size={12} className="text-[#FF7B00]" /> 3. Groq AI Parser
                </button>
              </div>

              {/* Tab views panel */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                {/* TAB 1: METADATA */}
                {activeTab === "metadata" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                        Article Title
                      </label>
                      <input
                        type="text"
                        value={activeArticle.title}
                        onChange={(e) => {
                          updateMeta("title", e.target.value);
                          // Auto generate slug if it's a new draft
                          if (activeArticle.slug.startsWith("new-article-")) {
                            updateMeta("slug", slugify(e.target.value));
                          }
                        }}
                        className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#05D9E8] focus:outline-none text-white font-body"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          URL Friendly Slug
                        </label>
                        <input
                          type="text"
                          value={activeArticle.slug}
                          onChange={(e) => updateMeta("slug", slugify(e.target.value))}
                          className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          Category
                        </label>
                        <select
                          value={activeArticle.category}
                          onChange={(e) => updateMeta("category", e.target.value)}
                          className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#05D9E8] text-zinc-300 font-body"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                        Standfirst / Dek (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={activeArticle.dek || ""}
                        onChange={(e) => updateMeta("dek", e.target.value)}
                        className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          Author Byline
                        </label>
                        <input
                          type="text"
                          value={activeArticle.author || ""}
                          onChange={(e) => updateMeta("author", e.target.value)}
                          className="w-full bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          Publish Date
                        </label>
                        <input
                          type="text"
                          value={activeArticle.date || ""}
                          onChange={(e) => updateMeta("date", e.target.value)}
                          className="w-full bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          Read Duration
                        </label>
                        <input
                          type="text"
                          value={activeArticle.readTime || ""}
                          onChange={(e) => updateMeta("readTime", e.target.value)}
                          className="w-full bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                        Hero Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={activeArticle.heroImage || ""}
                        onChange={(e) => updateMeta("heroImage", e.target.value)}
                        className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold flex justify-between">
                          <span>News Value Score</span>
                          <span className="text-[#FF7B00] font-bold">{activeArticle.newsValueScore || 50}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeArticle.newsValueScore || 50}
                          onChange={(e) => updateMeta("newsValueScore", parseInt(e.target.value))}
                          className="w-full accent-[#FF2A6D] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-semibold">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={activeArticle.tags ? activeArticle.tags.join(", ") : ""}
                          onChange={(e) => updateMeta("tags", e.target.value.split(",").map(t => t.trim()))}
                          className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#05D9E8] focus:outline-none text-white font-body"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: BLOCKS */}
                {activeTab === "blocks" && (
                  <div className="space-y-4">
                    {/* Add block quickbars */}
                    <div className="p-3 border border-white/15 bg-white/[0.02] rounded flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">
                        Add Layout Block:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => addBlock("lead")}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-pink-500/20 bg-pink-950/20 text-[#FF2A6D] uppercase tracking-wider rounded hover:bg-pink-950/40 transition"
                        >
                          + Lead Drop-cap
                        </button>
                        <button
                          onClick={() => addBlock("p")}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-zinc-500/30 bg-zinc-900 text-zinc-300 uppercase tracking-wider rounded hover:bg-zinc-800 transition"
                        >
                          + Paragraph
                        </button>
                        <button
                          onClick={() => addBlock("h2")}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-cyan-500/20 bg-cyan-950/20 text-[#05D9E8] uppercase tracking-wider rounded hover:bg-cyan-950/40 transition"
                        >
                          + Heading H2
                        </button>
                        <button
                          onClick={() => addBlock("pull")}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-amber-500/20 bg-amber-950/20 text-[#FF7B00] uppercase tracking-wider rounded hover:bg-amber-950/40 transition"
                        >
                          + Pullquote
                        </button>
                        <button
                          onClick={() => addBlock("image")}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-purple-500/20 bg-purple-950/20 text-purple-400 uppercase tracking-wider rounded hover:bg-purple-950/40 transition"
                        >
                          + Image Block
                        </button>
                      </div>
                    </div>

                    {/* Block lists */}
                    <div className="space-y-4">
                      {(!activeArticle.body || activeArticle.body.length === 0) ? (
                        <div className="p-8 text-center text-xs text-zinc-600 uppercase tracking-widest border border-dashed border-white/10 rounded">
                          No body blocks yet. Add layout blocks above.
                        </div>
                      ) : (
                        activeArticle.body.map((block, index) => {
                          const isLead = block.type === "lead";
                          const isH2 = block.type === "h2";
                          const isPull = block.type === "pull";
                          const isImage = block.type === "image";

                          return (
                            <div
                              key={index}
                              className={`p-4 rounded border ${
                                isLead 
                                  ? "border-pink-500/20 bg-pink-950/5" 
                                  : isH2 
                                  ? "border-cyan-500/20 bg-cyan-950/5" 
                                  : isPull 
                                  ? "border-amber-500/20 bg-amber-950/5" 
                                  : isImage 
                                  ? "border-purple-500/20 bg-purple-950/5" 
                                  : "border-white/10 bg-zinc-950/40"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-zinc-500">#{String(index + 1).padStart(2, "0")}</span>
                                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm ${
                                    isLead 
                                      ? "text-[#FF2A6D] bg-[#FF2A6D]/10" 
                                      : isH2 
                                      ? "text-[#05D9E8] bg-[#05D9E8]/10" 
                                      : isPull 
                                      ? "text-[#FF7B00] bg-[#FF7B00]/10" 
                                      : isImage 
                                      ? "text-purple-400 bg-purple-950/40" 
                                      : "text-zinc-300 bg-zinc-800"
                                  }`}>
                                    {block.type === "lead" ? "Lead Paragraph (Drop-cap)" : block.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => moveBlock(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition disabled:opacity-30"
                                    title="Move Up"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => moveBlock(index, 1)}
                                    disabled={index === activeArticle.body.length - 1}
                                    className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition disabled:opacity-30"
                                    title="Move Down"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button
                                    onClick={() => removeBlock(index)}
                                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                                    title="Delete Block"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>

                              {isImage ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
                                      Image Source URL
                                    </label>
                                    <input
                                      type="text"
                                      value={block.src || ""}
                                      onChange={(e) => updateBlock(index, "src", e.target.value)}
                                      className="w-full bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:border-purple-400 focus:outline-none text-white font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
                                      Image Caption (Uppercase Accented)
                                    </label>
                                    <input
                                      type="text"
                                      value={block.caption || ""}
                                      onChange={(e) => updateBlock(index, "caption", e.target.value)}
                                      className="w-full bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:border-purple-400 focus:outline-none text-white font-body"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <textarea
                                  rows={4}
                                  value={block.text || ""}
                                  onChange={(e) => updateBlock(index, "text", e.target.value)}
                                  className="w-full bg-[#121216] border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-white/20 text-white font-body leading-relaxed"
                                  placeholder="Enter block layout content..."
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: GROQ AI SUMMARIZER */}
                {activeTab === "groq" && (
                  <div className="space-y-5">
                    <div className="p-4 border border-[#FF7B00]/20 bg-[#FF7B00]/5 rounded text-zinc-300 text-xs leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 text-[#FF7B00] font-semibold">
                        <Sparkles size={14} />
                        <span className="uppercase tracking-widest text-[10px]">Groq AI Dynamic Layout Parser</span>
                      </div>
                      <p>
                        Paste the raw text of the scraped newsletter or external article. The Groq proxy will invoke the Llama 3 model to automatically extract, rewrite, and parse it into our structured schema blocks.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">
                          Raw Scraped Article Content
                        </label>
                        {activeArticle.sourceUrl && (
                          <a
                            href={activeArticle.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#05D9E8] hover:underline flex items-center gap-1"
                          >
                            View Original Scraped Source
                          </a>
                        )}
                      </div>
                      <textarea
                        rows={12}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste raw scraped text or copy-paste external content here..."
                        className="w-full bg-[#121216] border border-white/10 rounded p-3 text-xs focus:border-[#FF7B00] focus:outline-none text-white font-body leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.22em] text-zinc-500 mb-1.5 font-semibold">
                          Groq AI Engine Model
                        </label>
                        <select
                          value={groqModel}
                          onChange={(e) => setGroqModel(e.target.value)}
                          className="bg-[#121216] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:outline-none text-zinc-300 font-body"
                        >
                          <option value="llama3-70b-8192">Llama 3 70B (Recommended)</option>
                          <option value="llama3-8b-8192">Llama 3 8B (Faster)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleTriggerGroq}
                        disabled={groqLoading}
                        className="px-6 py-3 bg-gradient-to-r from-[#FF7B00] to-[#FF2A6D] hover:scale-[1.02] transition-transform text-white font-semibold tracking-[0.22em] text-xs uppercase rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 disabled:opacity-50"
                      >
                        {groqLoading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>AI Parsing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Summarize & Layout</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Publish Action bar */}
              <div className="border-t border-white/10 bg-[#0a0a0c] p-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleDeleteArticle(activeArticle.slug)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition text-xs tracking-wider uppercase font-semibold rounded"
                >
                  <Trash2 size={13} /> Delete Article
                </button>
                
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FF2A6D] text-white font-semibold text-xs tracking-widest uppercase hover:bg-[#FF7B00] transition rounded shadow-lg shadow-pink-500/10"
                >
                  <Save size={13} /> Publish Native News
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PANE 3: Live Preview (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col h-full bg-[#0a0a0c]/40 relative overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10 bg-[#0a0a0c] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#05D9E8] font-bold flex items-center gap-1.5">
              <Eye size={12} /> Cinematic Live Preview
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">
              Leonida Vice Template
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-[#050505] space-y-8 select-text">
            {!activeArticle ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-zinc-600 uppercase tracking-widest">
                No active article preview
              </div>
            ) : (
              <div className="space-y-6 max-w-xl mx-auto">
                {/* Hero Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white bg-[#FF2A6D] px-2 py-0.5 font-semibold">
                      {activeArticle.category || "LEAKS"}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.22em] text-zinc-500">
                      № 00 (LIVE EDIT)
                    </span>
                  </div>
                  
                  <h1 className="font-editorial text-2xl md:text-3xl text-white leading-tight font-black">
                    {activeArticle.title || "UNTITLED EDITORIAL"}
                  </h1>

                  <p className="font-editorial italic text-zinc-300 text-sm leading-relaxed border-b border-white/10 pb-4">
                    {activeArticle.dek || "No description provided."}
                  </p>

                  <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-zinc-400">
                    <span>By {activeArticle.author || "Editorial Desk"}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span>{activeArticle.date || "Today"}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="inline-flex items-center gap-1"><Clock size={10} /> {activeArticle.readTime || "5 min read"}</span>
                  </div>
                </div>

                {/* Hero Image Preview */}
                <div className="relative aspect-video rounded overflow-hidden border border-white/10 bg-zinc-950">
                  {activeArticle.heroImage ? (
                    <img
                      src={activeArticle.heroImage}
                      alt="Hero image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-zinc-600">
                      No cover image URL provided
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Body Blocks renderer */}
                <div className="space-y-5 text-sm leading-relaxed font-body">
                  {!activeArticle.body || activeArticle.body.length === 0 ? (
                    <p className="text-zinc-500 italic text-xs">No editorial content blocks defined.</p>
                  ) : (
                    activeArticle.body.map((block, idx) => {
                      if (block.type === "lead") {
                        return (
                          <p key={idx} className="drop-cap text-zinc-200 font-editorial text-base leading-relaxed mb-4">
                            {block.text}
                          </p>
                        );
                      }
                      
                      if (block.type === "p") {
                        return (
                          <p key={idx} className="text-zinc-300 font-body mb-3">
                            {block.text}
                          </p>
                        );
                      }

                      if (block.type === "h2") {
                        return (
                          <h2 key={idx} className="font-display uppercase text-lg text-white tracking-wide mt-6 mb-2 border-l-2 border-[#FF2A6D] pl-2 font-black">
                            {block.text}
                          </h2>
                        );
                      }

                      if (block.type === "pull") {
                        return (
                          <blockquote key={idx} className="relative my-6 px-4 py-4 border-y border-white/10 text-center">
                            <p className="font-editorial italic text-base text-zinc-100 leading-snug">
                              “{block.text}”
                            </p>
                          </blockquote>
                        );
                      }

                      if (block.type === "image") {
                        return (
                          <figure key={idx} className="my-6">
                            {block.caption && (
                              <figcaption className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border-l-2 border-[#FF2A6D] pl-2 mb-2 font-semibold">
                                {block.caption}
                              </figcaption>
                            )}
                            <div className="relative aspect-video overflow-hidden rounded border border-white/5 bg-zinc-950">
                              <img
                                src={block.src}
                                alt={block.caption || ""}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </figure>
                        );
                      }

                      return null;
                    })
                  )}
                </div>

                {/* Mock Tags */}
                {activeArticle.tags && activeArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                    {activeArticle.tags.map(t => (
                      <span key={t} className="text-[8px] uppercase tracking-wider text-zinc-300 border border-white/10 px-2 py-0.5 rounded-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
