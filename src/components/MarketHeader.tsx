import React, { useEffect, useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import type { Market } from '../lib/interface';
import { useMarketDetails } from '../hooks/useMarketDetails';

interface MarketDemoProps {
  marketData: Market;
}

// --- helpers ---
const formatAddress = (addr?: string, left = 6, right = 4) =>
  addr ? `${addr.slice(0, left)}...${addr.slice(-right)}` : 'N/A';

const formatUSD = (n?: number) =>
  typeof n === 'number'
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
    : '—';

function useCountdown(target?: string | number | Date) {
  const endsAt = useMemo(() => (target ? new Date(target) : undefined), [target]);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = useMemo(() => (endsAt ? +endsAt - +now : NaN), [endsAt, now]);
  const expired = useMemo(() => Number.isFinite(diffMs) && diffMs <= 0, [diffMs]);

  const isEndingSoon = !expired && diffMs <= 60 * 60 * 1000; // < 1 hour

  return {
    endsAt,
    expired,
    isEndingSoon,
  };
}

const MarketHeaderDemo: React.FC<MarketDemoProps> = ({ marketData }) => {
  const { data: marketDetails, isLoading } = useMarketDetails(marketData.marketId);

  const { endsAt, expired, isEndingSoon } = useCountdown(marketData.expiry_date);

  const totalPool = useMemo(() => {
    // API uses micro‑units; adjust if your API differs
    const raw = marketDetails?.totalVolume;
    return typeof raw === 'number' ? raw / 1e6 : undefined;
  }, [marketDetails?.totalVolume]);

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };


  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative p-6">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-blue-500/[0.02] rounded-2xl"></div>
      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Market Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text text-white tracking-tight mb-4">
            {marketData.question || 'Untitled Market'}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Contract */}
            <div className="group flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/60 hover:border-zinc-600/70 rounded-xl px-4 py-2.5 transition-all duration-200">
              <span className="text-xs text-zinc-400 font-medium">Contract</span>
              <span className="text-zinc-200 text-sm font-mono truncate max-w-[140px]" title={marketData.contract_address || ''}>
                {formatAddress(marketData.contract_address)}
              </span>
              <button
                onClick={() => handleCopy(marketData.contract_address)}
                className="text-zinc-400 hover:text-orange-400 transition-colors p-1 rounded-lg hover:bg-zinc-700/50"
                title="Copy contract address"
              >
                <Copy size={16} />
              </button>
            </div>

            {/* Total Pool */}
            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 hover:border-orange-400/40 rounded-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200">
              <span className="text-xs text-orange-100/90 mr-2 font-medium">Total Pool</span>
              <span className="text-white font-bold text-sm">
                {isLoading ? 'Loading…' : formatUSD(totalPool)}
              </span>
            </div>

          </div>
        </div>

        {/* Right: Creator & Time */}
        <div className="flex items-center gap-5">
          {/* Creator */}
          <div className="text-right">
            <div className="text-xs text-zinc-400 mb-2 font-medium">Creator</div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-zinc-100 text-sm font-semibold leading-tight">
                  {marketData.creator?.username || 'Unknown'}
                </span>
                <span
                  className="text-zinc-300 text-xs font-mono bg-zinc-800/70 border border-zinc-700/50 px-3 py-1 rounded-lg mt-1.5 truncate max-w-[140px] hover:bg-zinc-700/60 transition-colors duration-200"
                  title={marketData.creator?.wallet_address || ''}
                >
                  {formatAddress(marketData.creator?.wallet_address)}
                </span>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-zinc-400 font-medium">Ends</div>
            <div
              className="text-zinc-100 text-sm bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-zinc-700/60 transition-all duration-200"
              title={endsAt ? endsAt.toString() : 'N/A'}
            >
              {endsAt
                ? endsAt.toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'}
            </div>
            {!expired && isEndingSoon && (
              <div className="text-[11px] text-amber-400 font-semibold mt-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Ending soon</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeaderDemo;
