import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Share } from 'lucide-react';
import type { Market } from '../lib/interface';
import { useMarketDetails } from '../hooks/useMarketDetails';

interface MarketDemoProps {
  marketData: Market;
  onShareOnX?: () => void;
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

const MarketHeaderDemo: React.FC<MarketDemoProps> = ({ marketData, onShareOnX }) => {
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
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative p-4">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-blue-500/[0.02] rounded-2xl"></div>
      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-4">
          {marketData.question || 'Untitled Market'}
        </h1>

        {/* Info Row - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Top row - Contract and Total Pool */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Contract */}
            <div className="group flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/60 hover:border-zinc-600/70 rounded-lg px-3 py-2.5 transition-all duration-200 min-w-0">
              <span className="text-xs text-zinc-400 font-medium shrink-0">Contract</span>
              <span className="text-zinc-200 text-xs font-mono truncate" title={marketData.contract_address || ''}>
                {formatAddress(marketData.contract_address)}
              </span>
              <button
                onClick={() => handleCopy(marketData.contract_address)}
                className="text-zinc-400 hover:text-orange-400 transition-colors p-0.5 rounded hover:bg-zinc-700/50 shrink-0"
                title="Copy contract address"
              >
                <Copy size={14} />
              </button>
            </div>

            {/* Total Pool */}
            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 hover:border-orange-400/40 rounded-lg px-3 py-2.5 transition-all duration-200 shrink-0">
              <span className="text-xs text-orange-100/90 mr-2 font-medium">Total Pool</span>
              <span className="text-white font-bold text-sm">
                {isLoading ? 'Loading…' : formatUSD(totalPool)}
              </span>
            </div>
          </div>

          {/* Bottom row - Creator and Time */}
          <div className="text-left sm:text-right text-sm space-y-1">
            <div className="text-zinc-400 flex items-center justify-between">
              <span>Created by <span className="text-white font-medium">{marketData.creator?.username || 'Unknown'}</span></span>
              {/* Share on X Button - only visible on mobile */}
              {onShareOnX && (
                <button
                  onClick={onShareOnX}
                  className="lg:hidden flex items-center justify-center gap-2 bg-black border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2.5 transition-all duration-200 hover:bg-gray-900 ml-3 shrink-0"
                >
                  <Share size={14} className="text-white" />
                  <span className="text-white text-sm font-medium">Share on X</span>
                </button>
              )}
            </div>
            <div className="text-zinc-400">
              Ends <span className="text-white font-medium">
                {endsAt
                  ? endsAt.toLocaleString(undefined, {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </span>
              {!expired && isEndingSoon && (
                <span className="text-amber-400 font-semibold ml-2">• Ending soon</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeaderDemo;
