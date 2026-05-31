import { useState, useEffect, useCallback } from "react";
import { apiCall } from "./api";
import { 
  Cpu, 
  Activity, 
  Clock, 
  Database, 
  RefreshCw, 
  Terminal, 
  BarChart, 
  Zap, 
  AlertCircle, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function GroqUsagePanel({ apiKey }) {
  const [groqUsage, setGroqUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [resetReqText, setResetReqText] = useState("");
  const [resetTokText, setResetTokText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const d = await apiCall("/editorial/groq-usage", apiKey);
      if (d) setGroqUsage(d);
    } catch (e) {
      setErrorMsg(e.message || "Failed to load usage statistics");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const triggerLiveRefresh = async () => {
    setRefreshing(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const d = await apiCall("/editorial/groq-refresh", apiKey, "POST");
      if (d) {
        setSuccessMsg("Rate limits successfully synchronized directly from Groq Cloud servers!");
        // Refresh usage details to get the new rates and log entry
        const u = await apiCall("/editorial/groq-usage", apiKey);
        if (u) setGroqUsage(u);
        
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (e) {
      setErrorMsg(e.message || "Failed to sync rate limits from Groq servers. Verify API key configuration.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  // Cooldown countdown timers
  useEffect(() => {
    if (!groqUsage?.rate_limits) {
      setResetReqText("");
      setResetTokText("");
      return;
    }

    const { reset_requests, reset_tokens } = groqUsage.rate_limits;
    let reqSec = parseTimeToSeconds(reset_requests);
    let tokSec = parseTimeToSeconds(reset_tokens);

    // Initial setting
    setResetReqText(reset_requests || "—");
    setResetTokText(reset_tokens || "—");

    const timer = setInterval(() => {
      // Decrement Request Reset Timer (usually daily/hourly, updates every second)
      if (reqSec > 0) {
        reqSec = Math.max(0, reqSec - 1);
        setResetReqText(formatSecondsToTime(reqSec));
      }

      // Decrement Token Reset Timer (usually sub-minute, updates every 100ms)
      if (tokSec > 0) {
        tokSec = Math.max(0, tokSec - 0.1);
        setResetTokText(tokSec > 0 ? `${tokSec.toFixed(1)}s` : "0.0s");
      }
    }, 100);

    return () => clearInterval(timer);
  }, [groqUsage?.rate_limits]);

  // Helper parsers for time duration strings from Groq Cloud
  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    let seconds = 0;
    const hMatch = timeStr.match(/(\d+)h/);
    const mMatch = timeStr.match(/(\d+)m/);
    const sMatch = timeStr.match(/([\d\.]+)s/);
    const msMatch = timeStr.match(/(\d+)ms/);

    if (hMatch) seconds += parseInt(hMatch[1]) * 3600;
    if (mMatch) seconds += parseInt(mMatch[1]) * 60;
    if (sMatch) seconds += parseFloat(sMatch[1]);
    if (msMatch) seconds += parseInt(msMatch[1]) / 1000;

    return seconds;
  }

  function formatSecondsToTime(secs) {
    if (secs <= 0) return "0s";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    let res = "";
    if (h > 0) res += `${h}h `;
    if (m > 0 || h > 0) res += `${m}m `;
    res += `${s}s`;
    return res.trim();
  }

  // Formatting utilities
  const formatNum = (n) => (n !== undefined && n !== null ? Number(n).toLocaleString() : "0");
  
  // Calculate usage percentages
  const dailyTokenCap = groqUsage?.daily_token_limit || 500000;
  const tokenUsedToday = groqUsage?.tokens_used_today || 0;
  const tokenPct = Math.min(100, Math.round((tokenUsedToday / dailyTokenCap) * 100));

  // Extract from rate limit headers
  const liveLimitReq = groqUsage?.rate_limits?.limit_requests ? parseInt(groqUsage.rate_limits.limit_requests) : null;
  const liveRemainingReq = groqUsage?.rate_limits?.remaining_requests ? parseInt(groqUsage.rate_limits.remaining_requests) : null;
  
  // Calculate requests used from headers
  const requestsUsedToday = (liveLimitReq !== null && liveRemainingReq !== null)
    ? Math.max(0, liveLimitReq - liveRemainingReq)
    : (groqUsage?.requests_used_today || 0);

  const requestCap = liveLimitReq || groqUsage?.daily_request_limit || 14400;
  const reqPct = Math.min(100, Math.round((requestsUsedToday / requestCap) * 100));

  // Live minute token calculations
  const liveLimitTok = groqUsage?.rate_limits?.limit_tokens ? parseInt(groqUsage.rate_limits.limit_tokens) : null;
  const liveRemainingTok = groqUsage?.rate_limits?.remaining_tokens ? parseInt(groqUsage.rate_limits.remaining_tokens) : null;
  const tokensUsedMinute = (liveLimitTok !== null && liveRemainingTok !== null)
    ? Math.max(0, liveLimitTok - liveRemainingTok)
    : 0;
  const tokMinutePct = liveLimitTok ? Math.min(100, Math.round((tokensUsedMinute / liveLimitTok) * 100)) : 0;

  // Purpose clean label mappings
  const PURPOSE_METADATA = {
    general: { label: "General Chat", icon: "💬", color: "bg-zinc-500" },
    summarizer: { label: "Journalist Summarizer", icon: "📰", color: "bg-emerald-500" },
    rewriter: { label: "Headline Brand Persona", icon: "✏️", color: "bg-purple-500" },
    reprocess: { label: "Active AI Reprocess", icon: "⚡", color: "bg-rose-500" },
    status_check: { label: "Live rate-limit ping", icon: "🔍", color: "bg-[#05d9e8]" },
    gta_check: { label: "GTA 6 Ingest Relevance Gate", icon: "🛡️", color: "bg-amber-500" },
    unknown: { label: "Other Operations", icon: "⚙️", color: "bg-zinc-700" }
  };

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full font-sans select-text">
      
      {/* Top Notification Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 text-xs animate-fade-in">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header and Sync controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d] flex items-center gap-1.5">
            <Cpu size={10} className="text-[#ff2a6d]" />
            Core Infrastructure Audit
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            Groq AI Real-Time Console
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor rolling rate limits, token budgets, and live API headers fetched directly from your Groq developer organization.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading || refreshing}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/10 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading && !refreshing ? "animate-spin text-[#05d9e8]" : ""} />
            Reload Local
          </button>
          
          <button
            onClick={triggerLiveRefresh}
            disabled={loading || refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#05d9e8] to-[#ff2a6d] rounded-lg shadow-lg hover:shadow-cyan-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Zap size={14} className={refreshing ? "animate-spin text-white" : "text-cyan-300 animate-pulse"} />
            {refreshing ? "Syncing..." : "Query Groq Live Limits"}
          </button>
        </div>
      </div>

      {/* THREE BENTO METRIC GAUGE CARD BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Gauge 1: Daily Request Quota (Live from Headers) */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/50 p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ffb300]" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                Daily Request Quota (Live RPD)
              </span>
              <h4 className="text-xl font-bold font-display text-white mt-1">
                {formatNum(requestsUsedToday)} <span className="text-xs text-zinc-500">/ {formatNum(requestCap)}</span>
              </h4>
            </div>
            <div className="p-2 rounded-lg bg-[#ffb300]/10 border border-ffb300/20 text-[#ffb300]">
              <Activity size={16} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#ffb300] to-[#ff7b00] rounded-full transition-all duration-700"
              style={{ width: `${reqPct}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-400">
              {formatNum(requestCap - requestsUsedToday)} remaining
            </span>
            <span className="flex items-center gap-1 font-mono text-[#ffb300]">
              <Clock size={10} />
              resets in: {resetReqText || "—"}
            </span>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-[0.02] text-white pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Zap size={120} />
          </div>
        </div>

        {/* Gauge 2: Daily Token Budget (MongoDB logs vs Cap) */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/50 p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff2a6d]" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                Daily Token Budget (Logged TPD)
              </span>
              <h4 className="text-xl font-bold font-display text-white mt-1">
                {formatNum(tokenUsedToday)} <span className="text-xs text-zinc-500">/ {formatNum(dailyTokenCap)}</span>
              </h4>
            </div>
            <div className="p-2 rounded-lg bg-[#ff2a6d]/10 border border-[#ff2a6d]/20 text-[#ff2a6d]">
              <Database size={16} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#ff2a6d] to-[#ff7b00] rounded-full transition-all duration-700"
              style={{ width: `${tokenPct}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-400">
              {tokenPct}% allocated
            </span>
            <span className="text-zinc-400">
              {formatNum(Math.max(0, dailyTokenCap - tokenUsedToday))} tokens left
            </span>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-[0.02] text-white pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Database size={120} />
          </div>
        </div>

        {/* Gauge 3: Minute Token Rate (Live Cooldown Throttler) */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/50 p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#05d9e8]" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                Minute Token Throttle (Live TPM)
              </span>
              <h4 className="text-xl font-bold font-display text-white mt-1">
                {liveLimitTok !== null ? (
                  <>
                    {formatNum(tokensUsedMinute)} <span className="text-xs text-zinc-500">/ {formatNum(liveLimitTok)}</span>
                  </>
                ) : (
                  <span className="text-zinc-600 text-sm font-normal italic">Query Live to view limits</span>
                )}
              </h4>
            </div>
            <div className="p-2 rounded-lg bg-[#05d9e8]/10 border border-[#05d9e8]/20 text-[#05d9e8]">
              <Clock size={16} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#05d9e8] to-[#005f73] rounded-full transition-all duration-700"
              style={{ width: `${tokMinutePct}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-400">
              {liveLimitTok !== null ? `${formatNum(liveRemainingTok)} available` : "—"}
            </span>
            <span className="flex items-center gap-1 font-mono text-[#05d9e8] animate-pulse">
              <Clock size={10} />
              cooldown: {resetTokText || "—"}
            </span>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-[0.02] text-white pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Clock size={120} />
          </div>
        </div>

      </div>

      {/* CENTRAL SPLIT VIEW: PURPOSE DISTRIBUTION vs DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Purpose Allocator Bar Charts */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#121216]/40 p-5 shadow-2xl flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 mb-5 flex items-center gap-2">
            <BarChart size={14} className="text-[#05d9e8]" />
            Purpose Token Distribution
          </h3>

          <div className="flex-1 space-y-4">
            {groqUsage?.by_purpose_today && Object.keys(groqUsage.by_purpose_today).length > 0 ? (
              Object.entries(groqUsage.by_purpose_today).map(([pKey, details]) => {
                const meta = PURPOSE_METADATA[pKey] || PURPOSE_METADATA.unknown;
                const pPct = tokenUsedToday > 0 ? Math.round((details.tokens / tokenUsedToday) * 100) : 0;
                
                return (
                  <div key={pKey} className="group">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                      <span className="font-mono text-zinc-400">
                        {formatNum(details.tokens)} <span className="text-[10px] text-zinc-600">({pPct}%)</span>
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full ${meta.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-zinc-600 uppercase mt-0.5 font-bold">
                      <span>{details.requests} raw requests</span>
                      <span>{Math.round(details.tokens / (details.requests || 1))} avg tokens/req</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic py-12">
                No active token logs documented for today.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Rate Limits Details / Educational Panel */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#121216]/40 p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 mb-4 flex items-center gap-2">
              <Info size={14} className="text-[#ffb300]" />
              Rate Limits & System Caching Parameters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[10px] font-bold text-[#05d9e8] uppercase tracking-wide">Developer Account Tier</span>
                <p className="mt-1 font-semibold text-white">Free-Tier Sandbox Cap</p>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Daily allocations are dynamically locked at <span className="text-white font-semibold">14,400 Requests Per Day</span> and a sliding rolling budget of <span className="text-white font-semibold">500,000 Tokens Per Day</span>.
                </p>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[10px] font-bold text-[#ff2a6d] uppercase tracking-wide">Live Groq Cloud Cache</span>
                <p className="mt-1 font-semibold text-white">Context Prompt Caching Enabled</p>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  System instructions are automatically cached at the server boundary. Cached tokens are <span className="text-[#05d9e8] font-semibold">0-cost</span> and skip your active token limits.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#1c1c22]/30 border border-white/5 rounded-xl flex items-start gap-3">
              <HelpCircle size={18} className="text-[#ffb300] shrink-0 mt-0.5" />
              <div className="text-xs">
                <h5 className="font-bold text-zinc-300">Why are my limits changing?</h5>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Groq rate limits are calculated at your <span className="text-white">Organization Level</span>. If you run background scrapers, external tests, or share your API key, all token counts and remaining request budgets are computed in unison. The "Query Groq Live Limits" button synchronizes your precise console status instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Activity size={10} className="text-[#00c853]" />
              Database Status: Connected & Auditing API Logs
            </span>
            <span>
              Latest Sync: {groqUsage?.rate_limits?.timestamp ? new Date(groqUsage.rate_limits.timestamp).toLocaleTimeString() : "Never"}
            </span>
          </div>
        </div>

      </div>

      {/* RECENT API AUDIT LOG (CONDENSED TERMINAL BLOCK) */}
      <div className="rounded-xl border border-white/5 bg-[#121216]/30 p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 flex items-center gap-2">
            <Terminal size={14} className="text-[#ff2a6d]" />
            Developer API Ingestion Audit Trail
          </h3>
          <span className="text-[9px] font-mono bg-zinc-800 border border-white/5 px-2 py-0.5 rounded text-zinc-400">
            MongoDB: {groqUsage?.audit_log?.length || 0} active queries parsed
          </span>
        </div>

        <div className="overflow-x-auto ed-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operation / Purpose</th>
                <th className="py-2.5 px-3">Model Engine</th>
                <th className="py-2.5 px-3 text-right">Prompt Tokens</th>
                <th className="py-2.5 px-3 text-right">Completion Tokens</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
                <th className="py-2.5 px-3 text-right">Live Remaining Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {groqUsage?.audit_log && groqUsage.audit_log.length > 0 ? (
                groqUsage.audit_log.map((call, idx) => {
                  const callDate = call.timestamp ? new Date(call.timestamp) : null;
                  const purposeMeta = PURPOSE_METADATA[call.purpose] || PURPOSE_METADATA.unknown;
                  
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] font-mono text-[11px] text-zinc-400 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-500">
                        {callDate ? (
                          <>
                            {callDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}{" "}
                            {callDate.toLocaleTimeString("en-US", { hour12: false })}
                          </>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1.5 text-white">
                          <span>{purposeMeta.icon}</span>
                          <span className="font-sans font-semibold text-[11px]">
                            {call.purpose === "status_check" ? "Live Limits Sync" : purposeMeta.label}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-zinc-500">{call.model}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-zinc-400">{formatNum(call.prompt_tokens)}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-zinc-400">{formatNum(call.completion_tokens)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#05d9e8]">{formatNum(call.total_tokens)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-zinc-500">
                        {call.remaining_requests ? `${formatNum(call.remaining_requests)} left` : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-600 italic">
                    No active API calls tracked in MongoDB database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
