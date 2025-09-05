import React, { useMemo } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { Market } from '../lib/interface';

interface MarketTimelineProps {
  marketData: Market;
}

interface TimelineStep {
  label: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

const MarketTimeline: React.FC<MarketTimelineProps> = ({ marketData }) => {
  const timelineSteps: TimelineStep[] = useMemo(() => {
    const createdAt = new Date(marketData.createdAt);
    const expiryDate = new Date(marketData.expiry_date);
    const now = new Date();
    
    const isExpired = now >= expiryDate;
    const isResolved = marketData.isResolved || marketData.status === 'CLOSED';

    return [
      {
        label: 'Market created',
        date: createdAt.toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        time: createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        completed: true,
      },
      {
        label: 'Predictions close',
        date: expiryDate.toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        time: expiryDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        completed: isExpired,
        current: !isExpired && !isResolved,
      },
      {
        label: 'Resolution',
        date: '',
        time: '',
        completed: isResolved,
      },
    ];
  }, [marketData]);

  const isLive = !timelineSteps[1].completed && !timelineSteps[2].completed;
  const daysUntilExpiry = Math.ceil((new Date(marketData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hoursUntilExpiry = Math.ceil((new Date(marketData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60));

  let countdownText = '';
  if (isLive) {
    if (daysUntilExpiry > 0) {
      const remainingHours = Math.ceil(((new Date(marketData.expiry_date).getTime() - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      countdownText = `${daysUntilExpiry} days ${remainingHours} hours`;
    } else if (hoursUntilExpiry > 0) {
      countdownText = `${hoursUntilExpiry} hours`;
    } else {
      countdownText = 'Less than 1 hour';
    }
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 rounded-2xl shadow-xl overflow-hidden relative p-4">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-blue-500/[0.02] rounded-2xl"></div>
      
      <div className="relative z-10">
        {/* Header with status */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-white font-semibold text-sm">
            Market is {isLive ? 'live' : 'closed'}
          </span>
        </div>

        {/* Countdown - only show if market is live */}
        {isLive && (
          <div className="mb-4">
            <div className="text-zinc-400 text-sm mb-1">Settlement Countdown</div>
            <div className="text-white text-2xl font-bold">{countdownText}</div>
          </div>
        )}

        {/* Timeline Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-zinc-700"></div>
          
          <div className="space-y-4">
            {timelineSteps.map((step, index) => (
              <div key={index} className="relative flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 relative z-10 bg-zinc-900 rounded-full">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : step.current ? (
                    <Clock className="w-5 h-5 text-orange-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className={`font-medium text-sm ${
                      step.completed ? 'text-white' : 
                      step.current ? 'text-orange-100' : 
                      'text-zinc-400'
                    }`}>
                      {step.label}
                    </div>
                    {(step.date || step.time) && (
                      <div className={`text-xs ${
                        step.completed ? 'text-zinc-300' : 
                        step.current ? 'text-orange-200' : 
                        'text-zinc-500'
                      }`}>
                        {step.date} {step.time && `• ${step.time}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTimeline;