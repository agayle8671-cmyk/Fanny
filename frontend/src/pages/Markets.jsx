import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { lcnStocks, bawsaqStocks, marketIndices } from "../data/markets";

const Sparkline = ({ points, positive }) => {
  if (!points || points.length === 0) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 96;
  const h = 28;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const d = `M ${coords.join(" L ")}`;
  const stroke = positive ? "#05D9E8" : "#FF2A6D";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(coords[coords.length - 1].split(",")[0])}
        cy={(coords[coords.length - 1].split(",")[1])}
        r="2"
        fill={stroke}
      />
    </svg>
  );
};

const StockRow = ({ stock, idx }) => {
  const up = stock.change >= 0;
  const pct = ((stock.change / stock.price) * 100).toFixed(2);
  return (
    <tr
      data-testid={`stock-row-${stock.ticker.toLowerCase()}`}
      className="border-b border-white/5 hover:bg-white/[0.03] transition"
    >
      <td className="py-4 pl-4 pr-3">
        <span className="text-zinc-600 font-mono text-[10px] tabular-nums mr-3">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span className="font-display text-lg text-white tracking-wider">
          {stock.ticker}
        </span>
      </td>
      <td className="py-4 px-3 text-zinc-300">
        <div className="text-sm">{stock.name}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-0.5">
          {stock.sector}
        </div>
      </td>
      <td className="py-4 px-3 text-right">
        <span className="font-mono text-base text-white tabular-nums">
          ${stock.price.toFixed(2)}
        </span>
      </td>
      <td className={`py-4 px-3 text-right font-mono tabular-nums ${up ? "text-[#05D9E8]" : "text-[#FF2A6D]"}`}>
        <div className="inline-flex items-center gap-1 text-sm">
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {up ? "+" : ""}{stock.change.toFixed(2)}
        </div>
        <div className="text-[10px] mt-0.5">{up ? "+" : ""}{pct}%</div>
      </td>
      <td className="py-4 px-3 text-right hidden md:table-cell">
        <Sparkline points={stock.sparkline} positive={up} />
      </td>
      <td className="py-4 pr-4 pl-3 text-right text-[10px] text-zinc-500 uppercase tracking-[0.2em] hidden lg:table-cell">
        {stock.volume}
      </td>
    </tr>
  );
};

const MarketTable = ({ title, code, accent, stocks }) => (
  <section
    data-testid={`market-${code.toLowerCase()}`}
    className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
  >
    <header className="flex items-end justify-between px-5 md:px-7 py-5 border-b border-white/10">
      <div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>
          <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: accent }} />
          Live · {code}
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide leading-none">
          {title}
        </h2>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Movers</div>
        <div className="font-mono text-sm text-white">{stocks.length}</div>
      </div>
    </header>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            <th className="py-3 pl-4 pr-3 text-left font-semibold">Ticker</th>
            <th className="py-3 px-3 text-left font-semibold">Company</th>
            <th className="py-3 px-3 text-right font-semibold">Last</th>
            <th className="py-3 px-3 text-right font-semibold">Δ Day</th>
            <th className="py-3 px-3 text-right font-semibold hidden md:table-cell">Trend (7d)</th>
            <th className="py-3 pr-4 pl-3 text-right font-semibold hidden lg:table-cell">Vol</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <StockRow key={s.ticker} stock={s} idx={i} />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const Markets = () => {
  return (
    <div data-testid="markets-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] mb-4 font-semibold">
            The Trading Floor
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            Markets
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Leonida's dual exchanges. <span className="text-white">LCN</span> moves on what
            your protagonists do.{" "}
            <span className="text-white">BAWSAQ</span> moves on what every player in the
            world does — and now, on what the world says about them.
          </p>
        </header>

        {/* Indices strip */}
        <div
          data-testid="market-indices"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        >
          {marketIndices.map((idx) => {
            const up = idx.change >= 0;
            return (
              <div
                key={idx.name}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
                  <Activity size={11} className="text-[#05D9E8]" />
                  {idx.name}
                </div>
                <div className="font-mono text-2xl text-white tabular-nums">
                  {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={`mt-1 font-mono text-xs tabular-nums ${up ? "text-[#05D9E8]" : "text-[#FF2A6D]"}`}>
                  {up ? "▲" : "▼"} {Math.abs(idx.change).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-10 pb-24">
          <MarketTable
            title="Liberty City National"
            code="LCN"
            accent="#FF2A6D"
            stocks={lcnStocks}
          />
          <MarketTable
            title="BAWSAQ Global Exchange"
            code="BAWSAQ"
            accent="#05D9E8"
            stocks={bawsaqStocks}
          />
        </div>

        {/* Footer disclaimer */}
        <div className="pb-24 text-[10px] uppercase tracking-[0.3em] text-zinc-600 text-center max-w-3xl mx-auto leading-relaxed">
          Fictional exchanges modeled after Rockstar Games' Liberty City National (LCN) and
          BAWSAQ markets. Prices shown are seed data. Not investment advice. Not real money.
        </div>
      </div>
    </div>
  );
};

export default Markets;
