import React, { useState } from 'react';
import { FileText, Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { Market } from '../lib/interface';

interface MarketInfoProps {
  marketData: Market;
}

const MarketInfo: React.FC<MarketInfoProps> = ({ marketData }) => {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedResolutionCriteria, setExpandedResolutionCriteria] = useState(false);
  
  const hasDescription = marketData.description && marketData.description.trim().length > 0;
  const hasResolutionCriteria = marketData.resolution_criteria && marketData.resolution_criteria.trim().length > 0;

  // Check if text needs expansion (rough estimate based on character count)
  const descriptionNeedsExpansion = marketData.description && marketData.description.length > 200;
  const resolutionCriteriaNeedsExpansion = marketData.resolution_criteria && marketData.resolution_criteria.length > 200;

  if (!hasDescription && !hasResolutionCriteria) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 rounded-2xl p-6 space-y-6">
      {hasDescription && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-zinc-400" />
            <h4 className="text-white font-medium">Description</h4>
          </div>
          <div className="space-y-3">
            <p className={`text-zinc-200 leading-relaxed text-sm transition-all duration-300 ${
              expandedDescription ? '' : 'line-clamp-4'
            }`}>
              {marketData.description}
            </p>
            {descriptionNeedsExpansion && (
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
              >
                <span>{expandedDescription ? 'Show less' : 'Show more'}</span>
                {expandedDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      )}

      {hasResolutionCriteria && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-orange-400" />
            <h4 className="text-white font-medium">Resolution Criteria</h4>
          </div>
          <div className="space-y-3">
            <p className={`text-orange-200 leading-relaxed text-sm transition-all duration-300 ${
              expandedResolutionCriteria ? '' : 'line-clamp-3'
            }`}>
              {marketData.resolution_criteria}
            </p>
            {resolutionCriteriaNeedsExpansion && (
              <button
                onClick={() => setExpandedResolutionCriteria(!expandedResolutionCriteria)}
                className="flex items-center gap-1 text-orange-400 hover:text-orange-200 text-sm transition-colors"
              >
                <span>{expandedResolutionCriteria ? 'Show less' : 'Show more'}</span>
                {expandedResolutionCriteria ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInfo;