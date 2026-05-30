import { useState } from "react";
import { apiCall, CATEGORIES } from "./api";
import { FileText, Send, AlertCircle, CheckCircle } from "lucide-react";

export default function ManualEntryPanel({ apiKey }) {
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    aiSummary: "",
    category: "Intel",
    sourceUrl: "",
    sourceName: "",
    imageThumbnail: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.sourceUrl || !form.sourceName) {
      setErr("Title, Source URL, and Source Name are strictly required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const d = await apiCall("/editorial/manual-article", apiKey, "POST", {
        ...form,
        imageThumbnail: form.imageThumbnail || undefined
      });
      if (d.success) {
        setSaved(true);
        setForm({
          title: "",
          excerpt: "",
          aiSummary: "",
          category: "Intel",
          sourceUrl: "",
          sourceName: "",
          imageThumbnail: ""
        });
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErr(d.error ?? d.detail ?? "An unexpected API error occurred.");
      }
    } catch (e) {
      setErr(e.message || "Network request failed.");
    }
    setSaving(false);
  };

  const inputCls = "w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] placeholder-zinc-600 rounded-lg px-4 py-2.5 transition-all duration-200";

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
          Administrative Bypass
        </span>
        <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
          Manual Article Ingestion
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Directly inject custom field entries to the database — bypassing standard scraper queues and going live instantly
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
          <FileText size={16} className="text-[#ff2a6d]" />
          Create Custom Editorial Release
        </h3>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Title *</label>
            <input
              value={form.title}
              onChange={(e) => upd("title", e.target.value)}
              placeholder="e.g. GTA VI Development Enters Final Polish Phase..."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => upd("category", e.target.value)}
                className="w-full bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] rounded-lg px-4 py-2.5 cursor-pointer transition-all duration-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Hero Image URL (Optional)</label>
              <input
                value={form.imageThumbnail}
                onChange={(e) => upd("imageThumbnail", e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Source Name *</label>
              <input
                value={form.sourceName}
                onChange={(e) => upd("sourceName", e.target.value)}
                placeholder="e.g. Rockstar Games Bureau"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Source URL *</label>
              <input
                value={form.sourceUrl}
                onChange={(e) => upd("sourceUrl", e.target.value)}
                placeholder="https://rockstargames.com/newswire/..."
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">Excerpt / Raw Content</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => upd("excerpt", e.target.value)}
              placeholder="Paste the raw text content here..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">AI Summary / Excerpt Deck</label>
            <textarea
              value={form.aiSummary}
              onChange={(e) => upd("aiSummary", e.target.value)}
              placeholder="Write a 2-3 sentence print-style deck or summary..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {err && (
          <div className="flex items-center gap-2 text-[#ff2a6d] bg-[#ff2a6d]/5 border border-[#ff2a6d]/20 rounded-lg p-3 text-xs mb-6">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-[#00c853] bg-[#00c853]/5 border border-[#00c853]/20 rounded-lg p-3 text-xs mb-6">
            <CheckCircle size={14} className="flex-shrink-0" />
            <span>Article published and live in systems!</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={submit}
          disabled={saving}
          className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg border shadow-lg transition-all duration-300 justify-center w-full sm:w-auto"
          style={{
            backgroundColor: saved ? "#00c853" : "#ff2a6d",
            borderColor: saved ? "#00c853" : "#ff2a6d",
            boxShadow: saved ? "0 8px 24px rgba(0,200,83,0.15)" : "0 8px 24px rgba(255,42,109,0.15)",
            cursor: saving ? "not-allowed" : "pointer"
          }}
        >
          <Send size={14} />
          {saving ? "Publishing..." : saved ? "✓ Ingested Live!" : "Publish Custom Article →"}
        </button>
      </div>
    </div>
  );
}
