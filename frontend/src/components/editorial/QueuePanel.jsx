import { useState, useEffect, useDeferredValue, useMemo, useCallback } from "react";
import { apiCall, CATEGORIES, REJECTION_REASONS } from "./api";
import { getFallbackImage } from "../../lib/fallback-image";
import { 
  Sparkles, CheckCircle, AlertTriangle, AlertCircle, X, ShieldAlert,
  ArrowLeft, Clock, RefreshCw, Layers, Edit, Eye, Check, Play 
} from "lucide-react";

export default function QueuePanel({ apiKey, stats, onStatsChange }) {
  // Queue list states
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [catFilter, setCatFilter] = useState("all");

  // Selection states
  const [activeDraft, setActiveDraft] = useState(null); // the article currently loaded in editor
  const [rejectTarget, setRejectTarget] = useState(null);
  
  // Bulk select states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  // Editor states (only active when activeDraft is set)
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCategory, setEditorCategory] = useState("Intel");
  const [editorSummary, setEditorSummary] = useState("");
  const [editorHeroImage, setEditorHeroImage] = useState("");
  const [editorParagraphs, setEditorParagraphs] = useState([]);
  const [tuningPrompt, setTuningPrompt] = useState("");
  const [reprompting, setReprompting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editorScore, setEditorScore] = useState(65);

  // Reject Modal State
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Inline loading trackers
  const [reprocessingIds, setReprocessingIds] = useState(new Set());
  const [reAiingEditor, setReAiingEditor] = useState(false);
  const [reAiPublishingEditor, setReAiPublishingEditor] = useState(false);

  // Fetch queue drafts
  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const q = `status=${statusFilter}&category=${catFilter}&limit=50`;
      const d = await apiCall(`/editorial/queue?${q}`, apiKey);
      setArticles(d.articles ?? []);
      setTotal(d.total ?? 0);
    } catch (_) {}
    setLoading(false);
  }, [apiKey, statusFilter, catFilter]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Load draft into editor
  const startEditing = (article) => {
    setActiveDraft(article);
    setEditorTitle(article.title ?? "");
    setEditorCategory(article.category ?? "Intel");
    setEditorSummary(article.aiSummary ?? "");
    setEditorHeroImage(article.imageThumbnail ?? article.videoThumbnail ?? "");
    setEditorScore(article.newsValueScore ?? 65);
    
    // Parse raw content into paragraphs array
    const rawContent = article.aiContent || article.content || "";
    const paras = rawContent
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 10);
    setEditorParagraphs(paras.length > 0 ? paras : ["Placeholder lead paragraph.", "Placeholder core briefing.", "Placeholder take and context."]);
    setTuningPrompt("");
    setSaveSuccess(false);
  };

  const closeEditor = () => {
    setActiveDraft(null);
    loadQueue();
  };

  // Update paragraph at specific index
  const handleParagraphChange = (idx, text) => {
    setEditorParagraphs(prev => prev.map((p, i) => i === idx ? text : p));
  };

  // Re-Prompt sandbox proxy call
  const triggerRePrompt = async () => {
    if (!tuningPrompt.trim()) return;
    setRepprompting(true);
    try {
      const payload = {
        rawText: `Headline: "${editorTitle}"\nSummary: "${editorSummary}"\nContent:\n${editorParagraphs.join("\n\n")}\n\nInstructions: ${tuningPrompt}`,
        model: "llama-3.3-70b-versatile"
      };
      
      const res = await apiCall("/editorial/parse", apiKey, "POST", payload);
      
      if (res && !res.error) {
        if (res.title) setEditorTitle(res.title);
        if (res.category) setEditorCategory(res.category);
        if (res.aiSummary) setEditorSummary(res.aiSummary);
        if (res.heroImage) setEditorHeroImage(res.heroImage);
        if (res.newsValueScore) setEditorScore(res.newsValueScore);
        
        if (res.body && Array.isArray(res.body)) {
          const bodyParas = res.body
            .filter(b => b.type === "lead" || b.type === "p")
            .map(b => b.text);
          if (bodyParas.length > 0) setEditorParagraphs(bodyParas);
        } else if (res.aiContent) {
          const paras = res.aiContent
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 10);
          if (paras.length > 0) setEditorParagraphs(paras);
        }
        
        setTuningPrompt("");
      }
    } catch (_) {}
    setRepprompting(false);
  };

  // Save current active edit state to backend
  const saveDraft = async (silent = false) => {
    if (!activeDraft) return false;
    setSaving(true);
    try {
      const payload = {
        title: editorTitle,
        category: editorCategory,
        aiSummary: editorSummary,
        imageThumbnail: editorHeroImage,
        newsValueScore: Number(editorScore),
        aiContent: editorParagraphs.join("\n\n")
      };
      await apiCall(`/editorial/article/${activeDraft.id}`, apiKey, "PATCH", payload);
      if (!silent) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
      setSaving(false);
      return true;
    } catch (_) {
      setSaving(false);
      return false;
    }
  };

  // Quick action buttons
  const approveDraft = async (e, article) => {
    e?.stopPropagation();
    try {
      await apiCall(`/editorial/approve/${article.id}`, apiKey, "POST");
      loadQueue();
      onStatsChange();
    } catch (_) {}
  };

  const reAiAndPublish = async (e, article) => {
    e?.stopPropagation();
    setReprocessingIds(prev => {
      const s = new Set(prev);
      s.add(article.id);
      return s;
    });
    try {
      await apiCall(`/editorial/reprocess/${article.id}`, apiKey, "POST");
      await apiCall(`/editorial/approve/${article.id}`, apiKey, "POST");
      loadQueue();
      onStatsChange();
    } catch (_) {}
    setReprocessingIds(prev => {
      const s = new Set(prev);
      s.delete(article.id);
      return s;
    });
  };

  // Re-AI inside the editor — reprocess + refresh all editor fields
  const triggerReAiEditor = async (andPublish = false) => {
    if (!activeDraft) return;
    andPublish ? setReAiPublishingEditor(true) : setReAiingEditor(true);
    try {
      const res = await apiCall(`/editorial/reprocess/${activeDraft.id}`, apiKey, "POST");
      if (res && res.success) {
        if (res.title) setEditorTitle(res.title);
        if (res.aiSummary) setEditorSummary(res.aiSummary);
        if (res.newsValueScore) setEditorScore(res.newsValueScore);
        if (res.imageThumbnail) setEditorHeroImage(res.imageThumbnail);
        if (res.aiContent) {
          const paras = res.aiContent.split(/\n+/).map(p => p.trim()).filter(p => p.length > 10);
          if (paras.length > 0) setEditorParagraphs(paras);
        }
      }
      if (andPublish) {
        await apiCall(`/editorial/approve/${activeDraft.id}`, apiKey, "POST");
        onStatsChange();
        closeEditor();
      }
    } catch (_) {}
    andPublish ? setReAiPublishingEditor(false) : setReAiingEditor(false);
  };

  // Client-side: split a single paragraph at sentence boundary
  const splitParagraph = (idx) => {
    const para = editorParagraphs[idx];
    const sentences = para.match(/[^.!?]+[.!?]+\s*/g) || [para];
    const mid = Math.ceil(sentences.length / 2);
    const part1 = sentences.slice(0, mid).join('').trim();
    const part2 = sentences.slice(mid).join('').trim();
    if (!part2) return; // can't split
    setEditorParagraphs(prev => [
      ...prev.slice(0, idx),
      part1,
      part2,
      ...prev.slice(idx + 1)
    ]);
  };

  const publishActiveDraft = async () => {
    const ok = await saveDraft(true);
    if (!ok) return;
    await apiCall(`/editorial/approve/${activeDraft.id}`, apiKey, "POST");
    onStatsChange();
    closeEditor();
  };

  const submitRejectModal = async () => {
    setRejecting(true);
    try {
      await apiCall(`/editorial/reject/${rejectTarget}`, apiKey, "POST", { reason: reason || undefined });
      setRejectTarget(null);
      setReason("");
      if (activeDraft && activeDraft.id === rejectTarget) {
        closeEditor();
      } else {
        loadQueue();
      }
      onStatsChange();
    } catch (_) {}
    setRejecting(false);
  };

  // Bulk actions
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => setSelectedIds(new Set(articles.map(a => a.id)));
  const clearSelect = () => setSelectedIds(new Set());

  const bulkApprove = async () => {
    setBulkWorking(true);
    try {
      await apiCall("/editorial/bulk-approve", apiKey, "POST", { ids: Array.from(selectedIds) });
    } catch (_) {}
    setBulkWorking(false);
    setBulkMode(false);
    clearSelect();
    loadQueue();
    onStatsChange();
  };

  const bulkReject = async () => {
    setBulkWorking(true);
    try {
      await apiCall("/editorial/bulk-reject", apiKey, "POST", { ids: Array.from(selectedIds) });
    } catch (_) {}
    setBulkWorking(false);
    setBulkMode(false);
    clearSelect();
    loadQueue();
    onStatsChange();
  };

  // ─── Programmatic Gatekeeper Checklist & Uniqueness Offset calculations ───────
  const activeHeroImage = editorHeroImage || getFallbackImage(editorCategory, activeDraft?.id);
  const activeBodyImage = useMemo(() => {
    if (!activeDraft) return "";
    // Offset unique body image calculation based on slug hash sequentially to prevent duplicate images
    return getFallbackImage(editorCategory, activeDraft.id, activeDraft.aiTags || [], activeHeroImage);
  }, [editorCategory, activeDraft, activeHeroImage]);

  // Programmatic checklist requirements
  const checklist = useMemo(() => {
    if (!activeDraft) return null;
    const titleOk = editorTitle.trim().length > 5;
    const summaryOk = editorSummary.trim().length > 10;
    const parasOk = editorParagraphs.length >= 3;
    const imageOk = activeHeroImage && activeBodyImage && (activeHeroImage !== activeBodyImage);
    const densityOk = editorParagraphs.every(p => p.split(/\s+/).length <= 150);
    const categoryOk = CATEGORIES.includes(editorCategory);

    const score = (
      (titleOk ? 0.2 : 0) + 
      (summaryOk ? 0.2 : 0) + 
      (parasOk ? 0.2 : 0) + 
      (imageOk ? 0.2 : 0) + 
      (categoryOk ? 0.2 : 0)
    );

    return { titleOk, summaryOk, parasOk, imageOk, densityOk, categoryOk, score };
  }, [activeDraft, editorTitle, editorSummary, editorParagraphs, editorCategory, activeHeroImage, activeBodyImage]);

  const canPublish = checklist && checklist.score >= 1.0 && checklist.densityOk;

  // useDeferredValue optimization to prevent continuous layout calculation typing lag
  const deferredState = useDeferredValue({
    title: editorTitle,
    category: editorCategory,
    summary: editorSummary,
    heroImage: activeHeroImage,
    bodyImage: activeBodyImage,
    paragraphs: editorParagraphs,
    score: editorScore
  });

  return (
    <div className="flex flex-col h-full bg-[#050505] text-[#f9f9fa] overflow-hidden">
      <style>{`
        .drop-cap::first-letter {
          font-family: "Playfair Display", serif;
          float: left;
          font-size: 5.5rem;
          line-height: 0.9;
          font-weight: 800;
          margin: 0.4rem 1rem 0 0;
          color: #fff;
          background: linear-gradient(180deg, #ff2a6d 0%, #ff7b00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* RENDER MODE A: ACTIVE SPLIT SCREEN WYSIWYG EDITOR */}
      {activeDraft ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-full">
          {/* Left panel: controls and sandbox inputs */}
          <div className="flex flex-col h-full border-r border-white/5 bg-[#0A0A0C] overflow-y-auto p-6 scrollbar-thin">
            {/* Header / Back Action */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <button
                onClick={closeEditor}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Queue
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerReAiEditor(false)}
                  disabled={reAiingEditor || reAiPublishingEditor || saving}
                  className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border border-[#05d9e8]/20 bg-[#05d9e8]/10 text-[#05d9e8] hover:bg-[#05d9e8]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {reAiingEditor ? <><RefreshCw size={10} className="animate-spin" /> Re-AI...</> : <>⚡ Re-AI</>}
                </button>
                <button
                  onClick={() => saveDraft()}
                  disabled={saving || reAiingEditor || reAiPublishingEditor}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                >
                  {saving ? "Saving..." : saveSuccess ? "✓ Saved!" : "Save Draft"}
                </button>
                <button
                  onClick={() => triggerReAiEditor(true)}
                  disabled={reAiPublishingEditor || reAiingEditor || saving}
                  className="px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all duration-300"
                  style={{
                    backgroundColor: "#05d9e8",
                    borderColor: "#05d9e8",
                    color: "#000",
                    boxShadow: "0 8px 24px rgba(5,217,232,0.2)",
                    opacity: (reAiPublishingEditor || reAiingEditor || saving) ? 0.4 : 1,
                    cursor: (reAiPublishingEditor || reAiingEditor || saving) ? "not-allowed" : "pointer"
                  }}
                >
                  {reAiPublishingEditor ? <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Publishing...</span> : "⚡ Re-AI & Publish"}
                </button>
                <button
                  onClick={publishActiveDraft}
                  disabled={!canPublish || saving || reAiingEditor || reAiPublishingEditor}
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-white border transition-all duration-300"
                  style={{
                    backgroundColor: canPublish ? "#ff2a6d" : "rgba(255,42,109,0.05)",
                    borderColor: canPublish ? "#ff2a6d" : "rgba(255,42,109,0.1)",
                    opacity: canPublish ? 1 : 0.4,
                    cursor: canPublish ? "pointer" : "not-allowed",
                    boxShadow: canPublish ? "0 8px 24px rgba(255,42,109,0.15)" : "none"
                  }}
                >
                  ✓ Approve & Publish
                </button>
              </div>
            </div>

            {/* Diagnostic Gatekeeper checklist */}
            {checklist && (
              <div className="p-4 rounded-xl border border-white/5 bg-[#121216]/50 mb-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff2a6d]">Layout Gatekeeper</span>
                    <span className="text-xs font-bold font-display" style={{ color: canPublish ? "#00c853" : "#ffb300" }}>
                      Completeness Score: {Math.round(checklist.score * 100)}%
                    </span>
                  </div>
                  
                  {/* Visual bullet validations list */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] uppercase font-bold tracking-wider">
                    <span className={`flex items-center gap-1.5 ${checklist.titleOk ? "text-[#00c853]" : "text-zinc-500"}`}>
                      {checklist.titleOk ? "✓" : "✕"} Title Valid
                    </span>
                    <span className={`flex items-center gap-1.5 ${checklist.categoryOk ? "text-[#00c853]" : "text-zinc-500"}`}>
                      {checklist.categoryOk ? "✓" : "✕"} Category Valid
                    </span>
                    <span className={`flex items-center gap-1.5 ${checklist.summaryOk ? "text-[#00c853]" : "text-zinc-500"}`}>
                      {checklist.summaryOk ? "✓" : "✕"} Deck Summary
                    </span>
                    <span className={`flex items-center gap-1.5 ${checklist.parasOk ? "text-[#00c853]" : "text-zinc-500"}`}>
                      {checklist.parasOk ? "✓" : "✕"} Paragraph count ({editorParagraphs.length})
                    </span>
                    <span className={`flex items-center gap-1.5 ${checklist.imageOk ? "text-[#00c853]" : "text-zinc-500"}`}>
                      {checklist.imageOk ? "✓" : "✕"} Unique Assets
                    </span>
                    <span className={`flex items-center gap-1.5 ${checklist.densityOk ? "text-[#00c853]" : "text-[#ff2a6d]"}`}>
                      {checklist.densityOk ? "✓" : "✕"} Density &lt; 150w
                    </span>
                  </div>
                </div>

                {!canPublish && (
                  <div className="flex items-start gap-2 max-w-[200px] border border-[#ff2a6d]/20 bg-[#ff2a6d]/5 rounded-lg p-3 text-[10px] font-medium leading-normal text-zinc-300 flex-shrink-0">
                    <AlertTriangle size={14} className="text-[#ff2a6d] flex-shrink-0" />
                    <div>
                      <span className="text-[#ff2a6d] font-bold">Blocked:</span> Ensure all checklist validations are green and paragraph word counts are under 150 words.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inputs edit forms */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Article Title</label>
                <input
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Category</label>
                  <select
                    value={editorCategory}
                    onChange={(e) => setEditorCategory(e.target.value)}
                    className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">News Score (0 - 100)</label>
                  <input
                    type="number"
                    value={editorScore}
                    onChange={(e) => setEditorScore(Number(e.target.value))}
                    min={0} max={100}
                    className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Hero Image Thumbnail URL</label>
                <input
                  value={editorHeroImage}
                  onChange={(e) => setEditorHeroImage(e.target.value)}
                  placeholder="Insert landscape image URL..."
                  className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">AI Summary / Deck Briefing</label>
                <textarea
                  value={editorSummary}
                  onChange={(e) => setEditorSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Dynamic Paragraph Inputs */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Editorial Paragraph Blocks</label>
                <div className="space-y-4">
                  {editorParagraphs.map((para, i) => {
                    const wordsCount = para.split(/\s+/).filter(Boolean).length;
                    const tooDense = wordsCount > 150;
                    return (
                      <div key={i} className="relative">
                        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                          <span>Block {i + 1} {i === 0 ? "(Lead paragraph)" : i === 1 ? "(Core briefing)" : i === 2 ? "(Take & Context)" : ""}</span>
                          <div className="flex items-center gap-2">
                            {tooDense && (
                              <button
                                onClick={() => splitParagraph(i)}
                                className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[#ff2a6d] border border-[#ff2a6d]/30 bg-[#ff2a6d]/10 hover:bg-[#ff2a6d]/20 px-2 py-0.5 rounded transition-all"
                              >
                                ⚡ Auto-Split
                              </button>
                            )}
                            <span style={{ color: tooDense ? "#ff2a6d" : "rgba(255,255,255,0.3)" }}>
                              {wordsCount} / 150 words {tooDense ? "⚠ Too Dense" : ""}
                            </span>
                          </div>
                        </div>
                        <textarea
                          value={para}
                          onChange={(e) => handleParagraphChange(i, e.target.value)}
                          rows={4}
                          className="w-full bg-[#121216] border focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 leading-relaxed resize-none transition-all"
                          style={{
                            borderColor: tooDense ? "rgba(255,42,109,0.3)" : "rgba(255,255,255,0.05)",
                            focusBorderColor: tooDense ? "#ff2a6d" : "#ff2a6d/50"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Groq reprompt AI sandbox */}
            <div className="rounded-xl border border-white/5 bg-[#121216]/20 p-5 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff2a6d] flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#ff2a6d] animate-pulse" />
                Groq AI Tuning Sandbox
              </h4>
              <p className="text-[10px] text-zinc-500 mb-3">
                Type visual alignment instructions (e.g. *"Rewrite headline to emphasize Florida vibes"*) to trigger dynamic LLM updates.
              </p>
              <div className="space-y-3">
                <textarea
                  value={tuningPrompt}
                  onChange={(e) => setTuningPrompt(e.target.value)}
                  placeholder="Describe your tuning revisions (e.g. 'Make the lead paragraph focus more on GTA 6 leaks' or 'Make the summary sound more conspiratorial')..."
                  rows={2}
                  className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] placeholder-zinc-600 rounded-lg px-4 py-2.5 resize-none leading-relaxed transition-all"
                />
                <button
                  onClick={triggerRePrompt}
                  disabled={reprompting || !tuningPrompt.trim()}
                  className="flex items-center justify-center gap-2 w-full text-[#05d9e8] bg-[#05d9e8]/5 hover:bg-[#05d9e8]/10 border border-[#05d9e8]/20 hover:border-[#05d9e8]/50 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {reprompting ? (
                    <>
                      <RefreshCw size={12} className="animate-spin text-[#05d9e8]" />
                      Re-prompting Groq Llama...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} fill="#05d9e8" />
                      Submit AI Tuning Prompt
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Back bottom footer actions */}
            <div className="mt-8 flex gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => setRejectTarget(activeDraft.id)}
                className="flex-1 bg-transparent hover:bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/10 hover:border-[#ff2a6d]/30 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200"
              >
                ✕ Reject Draft
              </button>
            </div>
          </div>

          {/* Right panel: live deferred WYSIWYG preview */}
          <div className="h-full overflow-y-auto bg-[#050505] p-8 scrollbar-thin relative scanline vignette">
            {/* Live Indicator overlay badge */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-[#00c853]/10 border border-[#00c853]/30 px-3 py-1 rounded-full text-[9px] uppercase tracking-wider text-[#00c853] font-bold">
              <Eye size={12} />
              WYSIWYG Live Preview
            </div>

            {/* Deferred article template renderer */}
            <div className="max-w-2xl mx-auto pt-10">
              {/* Category / issue tag */}
              <div className="flex items-center gap-3 mb-5">
                <span className="font-display text-[10px] tracking-[0.35em] uppercase text-white bg-[#ff2a6d] px-3 py-1.5">
                  {deferredState.category}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                  № {String(1).padStart(2, "0")}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-editorial text-3xl md:text-5xl text-white leading-[1.08] mb-8">
                {deferredState.title || "Headline Intel Pending..."}
              </h1>

              {/* Byline metadata */}
              <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-8">
                <span
                  className="h-9 w-9 rounded-full grid place-items-center font-display text-xs text-white"
                  style={{ background: "linear-gradient(135deg, #ff2a6d 0%, #ff7b00 100%)" }}
                >
                  LV
                </span>
                <div>
                  <div className="text-xs text-white font-semibold">Leonida Vice Writer</div>
                  <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5">
                    {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  <Clock size={12} /> 3 MIN READ
                </div>
              </div>

              {/* Editorial prose template */}
              <div className="space-y-6">
                {deferredState.paragraphs.map((pText, idx) => {
                  if (idx === 0) {
                    return (
                      <p key={idx} className="drop-cap text-lg md:text-xl leading-[1.65] text-zinc-100 font-editorial mb-8">
                        {pText}
                      </p>
                    );
                  }

                  const blocks = [];

                  // Insert Section H2 before block 1 (core briefing)
                  if (idx === 1) {
                    blocks.push(
                      <h2 key="h2-1" className="font-display uppercase text-2xl md:text-3xl text-white tracking-[0.02em] mt-12 mb-5 border-l-4 border-[#ff2a6d] pl-4">
                        Core Intel Briefing
                      </h2>
                    );
                  }

                  // Insert Pull Quote after block 1
                  if (idx === 2) {
                    blocks.push(
                      <blockquote key="pullquote" className="relative border-y border-white/10 my-10 py-8 text-center max-w-lg mx-auto">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-editorial text-7xl text-[#ff2a6d] select-none opacity-50">“</span>
                        <p className="font-editorial italic text-lg md:text-xl text-zinc-100 leading-normal">
                          {deferredState.summary.length > 130 ? deferredState.summary.slice(0, 130) + "..." : deferredState.summary || "Summary quote pending."}
                        </p>
                      </blockquote>
                    );
                    blocks.push(
                      <h2 key="h2-2" className="font-display uppercase text-2xl md:text-3xl text-white tracking-[0.02em] mt-12 mb-5 border-l-4 border-[#ff2a6d] pl-4">
                        Why It Matters
                      </h2>
                    );
                  }

                  // Insert visual body image after block 2
                  if (idx === 3 && deferredState.bodyImage) {
                    blocks.push(
                      <div key="body-img" className="relative my-8 border border-white/5 rounded-xl overflow-hidden">
                        <img src={deferredState.bodyImage} alt="" className="w-full max-h-[350px] object-cover object-center" />
                        <div className="border-l-2 border-[#ff2a6d] pl-3 text-zinc-400 uppercase tracking-[0.25em] text-[9px] mt-3 mx-4 pb-3">
                          Field Intel Bureau: {deferredState.category} Coverage Telemetry
                        </div>
                      </div>
                    );
                    blocks.push(
                      <h2 key="h2-3" className="font-display uppercase text-2xl md:text-3xl text-white tracking-[0.02em] mt-12 mb-5 border-l-4 border-[#ff2a6d] pl-4">
                        Leonida Take & Context
                      </h2>
                    );
                  }

                  blocks.push(
                    <p key={`p-${idx}`} className="text-base md:text-lg leading-[1.75] text-zinc-300 font-body mb-6">
                      {pText}
                    </p>
                  );

                  return blocks;
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RENDER MODE B: DEFAULT DRAFTS LIST VIEW */
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Controls sub-filters bar */}
          <div className="p-4 bg-[#121216]/50 border-b border-white/5 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex bg-[#1c1c22]/50 rounded-lg p-1 gap-1">
              {["pending", "rejected"].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); clearSelect(); }}
                  className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: statusFilter === s ? "#ff2a6d" : "transparent",
                    color: statusFilter === s ? "white" : "#a1a1aa",
                    boxShadow: statusFilter === s ? "0 4px 12px rgba(255,42,109,0.2)" : "none"
                  }}
                >
                  {s} Queue
                  {s === "pending" && stats ? (
                    <span className="bg-white/10 text-white rounded-full text-[9px] px-2 py-0.5 ml-2 font-black">
                      {stats.pending}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 items-center">
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="bg-[#1c1c22] border border-white/5 text-xs text-[#f9f9fa] rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button
                onClick={() => { setBulkMode(b => !b); clearSelect(); }}
                className="flex items-center gap-1 bg-transparent hover:bg-white/[0.04] border border-white/10 text-zinc-300 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                {bulkMode ? "✕ Cancel Bulk" : "⊞ Bulk Select"}
              </button>

              {bulkMode && selectedIds.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={bulkApprove}
                    disabled={bulkWorking}
                    className="bg-[#00c853] hover:bg-[#00c853]/90 text-white font-bold uppercase tracking-wider text-xs px-4 py-1.5 rounded-lg border border-[#00c853]/30 transition-all flex items-center gap-1"
                  >
                    ✓ Approve {selectedIds.size}
                  </button>
                  <button
                    onClick={bulkReject}
                    disabled={bulkWorking}
                    className="bg-transparent hover:bg-[#ff2a6d]/10 border border-[#ff2a6d]/20 text-[#ff2a6d] font-bold uppercase tracking-wider text-xs px-4 py-1.5 rounded-lg transition-all flex items-center gap-1"
                  >
                    ✕ Reject {selectedIds.size}
                  </button>
                </div>
              )}

              {bulkMode && (
                <div className="flex gap-1.5 border-l border-white/10 pl-2.5">
                  <button onClick={selectAll} className="bg-transparent hover:bg-white/[0.03] text-zinc-400 py-1.5 px-2.5 rounded-lg text-[10px] uppercase font-bold tracking-wider">All</button>
                  <button onClick={clearSelect} className="bg-transparent hover:bg-white/[0.03] text-zinc-400 py-1.5 px-2.5 rounded-lg text-[10px] uppercase font-bold tracking-wider">None</button>
                </div>
              )}
            </div>
          </div>

          {/* Table list view */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
            {!loading && articles.length === 0 && (
              <div className="text-center py-20 border border-white/5 rounded-xl bg-[#121216]/10">
                <span className="text-4xl block mb-4">🏆</span>
                <h3 className="text-base font-bold text-white">Editorial Review Queue is clear!</h3>
                <p className="text-xs text-zinc-500 mt-2">No drafts are currently flagged in `{statusFilter}` status.</p>
              </div>
            )}

            {loading && articles.length === 0 && (
              <div className="text-center py-20">
                <RefreshCw size={24} className="animate-spin text-[#ff2a6d] mx-auto mb-3" />
                <span className="text-xs text-zinc-500">Querying scraper logs database...</span>
              </div>
            )}

            {articles.map((a) => {
              const hasSummary = a.aiSummary && a.aiSummary.trim().length > 10;
              const thumb = a.imageThumbnail || a.videoThumbnail;

              return (
                <div key={a.id} className="flex gap-3 items-center group">
                  {bulkMode && (
                    <div onClick={() => toggleSelect(a.id)} className="cursor-pointer p-1.5 flex-shrink-0">
                      <div className="w-5 h-5 rounded border-2 border-white/10 flex items-center justify-center transition-all"
                        style={{
                          borderColor: selectedIds.has(a.id) ? "#ff2a6d" : "rgba(255,255,255,0.15)",
                          backgroundColor: selectedIds.has(a.id) ? "#ff2a6d" : "transparent"
                        }}
                      >
                        {selectedIds.has(a.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => startEditing(a)}
                    className="flex-1 relative overflow-hidden rounded-xl border border-white/5 bg-[#121216]/30 hover:bg-[#1c1c22]/40 hover:border-[#ff2a6d]/20 transition-all duration-300 p-5 shadow-xl hover:shadow-[#ff2a6d]/5 flex gap-4 cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="group/thumb relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-white/5">
                      <img
                        src={thumb || getFallbackImage(a.category, a.id)}
                        alt=""
                        className="w-full h-full object-cover transition-all"
                        onError={(e) => {
                          e.target.src = getFallbackImage(a.category, a.id);
                        }}
                      />
                    </div>

                    {/* Metadata Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#ff2a6d] bg-[#ff2a6d]/10 px-2 py-0.5 rounded border border-[#ff2a6d]/20">
                          {a.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{a.sourceName}</span>
                        <span className="text-[10px] text-zinc-600 ml-auto font-medium">
                          {new Date(a.scrapedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-white truncate leading-snug group-hover:text-[#05d9e8] transition-colors mb-1.5">
                        {a.title}
                      </h4>

                      {hasSummary ? (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {a.aiSummary}
                        </p>
                      ) : (
                        <span className="text-xs text-zinc-500 italic block">No summary yet generated. Click Edit to re-AI.</span>
                      )}
                    </div>

                    {/* Quick Action Side Buttons */}
                    <div className="flex flex-col gap-2 justify-center flex-shrink-0 min-w-[110px] border-l border-white/5 pl-4 ml-2">
                      <button
                        onClick={(e) => reAiAndPublish(e, a)}
                        disabled={reprocessingIds.has(a.id)}
                        className="flex items-center justify-center gap-1 bg-[#05d9e8]/10 hover:bg-[#05d9e8] text-[#05d9e8] hover:text-black border border-[#05d9e8]/20 hover:border-[#05d9e8]/50 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reprocessingIds.has(a.id) ? (
                          <>
                            <RefreshCw size={10} className="animate-spin text-[#05d9e8]" />
                            Reprocessing...
                          </>
                        ) : (
                          "⚡ Re-AI & Publish"
                        )}
                      </button>
                      <button
                        onClick={(e) => approveDraft(e, a)}
                        className="flex items-center justify-center gap-1 bg-[#ff2a6d]/10 hover:bg-[#ff2a6d] text-[#ff2a6d] hover:text-white border border-[#ff2a6d]/20 hover:border-[#ff2a6d]/50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(a); }}
                        className="flex items-center justify-center gap-1 bg-transparent hover:bg-white/[0.03] text-zinc-400 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setRejectTarget(a.id); }}
                        className="flex items-center justify-center gap-1 bg-transparent hover:bg-white/[0.03] text-zinc-500 hover:text-[#ff2a6d] border border-transparent hover:border-[#ff2a6d]/10 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center backdrop-blur-md">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 w-[420px] shadow-2xl relative">
            <button 
              onClick={() => setRejectTarget(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-lg bg-[#ff2a6d]/10 flex items-center justify-center text-lg text-[#ff2a6d] border border-[#ff2a6d]/20">✕</div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Reject Scraped Draft</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Track audit rejection patterns</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {REJECTION_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border text-xs transition-all duration-150 flex items-center justify-between"
                  style={{
                    backgroundColor: reason === r ? "rgba(255,42,109,0.05)" : "transparent",
                    borderColor: reason === r ? "#ff2a6d" : "rgba(255,255,255,0.05)",
                    color: reason === r ? "white" : "#a1a1aa",
                    fontWeight: reason === r ? "bold" : "normal"
                  }}
                >
                  <span>{r}</span>
                  {reason === r && <Check size={12} className="text-[#ff2a6d]" strokeWidth={3} />}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                onClick={() => setRejectTarget(null)}
                className="bg-transparent hover:bg-white/[0.03] border border-white/10 text-zinc-400 py-2 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitRejectModal}
                disabled={rejecting || !reason}
                className="bg-[#ff2a6d] hover:bg-[#ff2a6d]/90 text-white font-bold uppercase tracking-wider text-xs py-2 px-6 rounded-lg border border-[#ff2a6d]/50 transition-all shadow-lg shadow-[#ff2a6d]/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {rejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
