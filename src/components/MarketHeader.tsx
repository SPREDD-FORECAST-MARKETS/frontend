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
    <div className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden relative p-4">
      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Market Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text text-white tracking-tight mb-4">
            {marketData.question || 'Untitled Market'}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Contract */}
            <div className="group flex items-center gap-2 bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-full px-4 py-2">
              <span className="text-xs text-gray-400">Contract</span>
              <span className="text-gray-200 text-sm font-mono truncate max-w-[140px]" title={marketData.contract_address || ''}>
                {formatAddress(marketData.contract_address)}
              </span>
              <button
                onClick={() => handleCopy(marketData.contract_address)}
                className="text-gray-400 hover:text-[#ff6b35] transition-colors p-1 rounded-full hover:bg-gray-700/50"
                title="Copy contract address"
              >
                <Copy size={16} />
              </button>
            </div>

            {/* Total Pool */}
            <div className="bg-gradient-to-r from-[#ff6b35]/40 to-[#ff8c42]/40 border border-[#ff6b35]/50 rounded-full px-4 py-2 shadow-lg">
              <span className="text-xs text-white/80 mr-2">Total Pool</span>
              <span className="text-white font-semibold text-sm">
                {isLoading ? 'Loading…' : formatUSD(totalPool)}
              </span>
            </div>

          </div>
        </div>

        {/* Right: Creator & Time */}
        <div className="flex items-center gap-5">
          {/* Creator */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1.5 font-medium">Creator</div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-gray-100 text-sm font-medium leading-tight">
                  {marketData.creator?.username || 'Unknown'}
                </span>
                <span
                  className="text-gray-300 text-xs font-mono bg-gray-800/60 px-2 py-0.5 rounded-full mt-1 truncate max-w-[140px]"
                  title={marketData.creator?.wallet_address || ''}
                >
                  {formatAddress(marketData.creator?.wallet_address)}
                </span>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-gray-400 font-medium">Ends</div>
            <div
              className="text-gray-100 text-sm bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-full"
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
              <div className="text-[11px] text-yellow-300/90 font-medium mt-1">Ending soon</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeaderDemo;
