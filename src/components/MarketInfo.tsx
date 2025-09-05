import React from 'react';
import { FileText, Target } from 'lucide-react';
import type { Market } from '../lib/interface';

interface MarketInfoProps {
  marketData: Market;
}

const MarketInfo: React.FC<MarketInfoProps> = ({ marketData }) => {
  const hasDescription = marketData.description && marketData.description.trim().length > 0;
  const hasResolutionCriteria = marketData.resolution_criteria && marketData.resolution_criteria.trim().length > 0;

  if (!hasDescription && !hasResolutionCriteria) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 rounded-2xl p-4 space-y-4">
      {hasDescription && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-zinc-400" />
            <h4 className="text-white font-medium">Description</h4>
          </div>
          <p className="text-zinc-200 leading-relaxed text-sm line-clamp-4">
            {marketData.description}
          </p>
        </div>
      )}

      {hasResolutionCriteria && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-orange-400" />
            <h4 className="text-white font-medium">Resolution Criteria</h4>
          </div>
          <p className="text-orange-200 leading-relaxed text-sm line-clamp-4">
            {marketData.resolution_criteria}
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketInfo;