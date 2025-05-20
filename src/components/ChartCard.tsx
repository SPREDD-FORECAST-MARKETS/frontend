import { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import TimeframeSelector from './TimeFrameSelector';
import type { MarketData, ChartDataPoint, TimeframeOption } from '../lib/interface';
import { calculateOdds } from '../utils/calculations';

interface ChartCardProps {
  marketData: MarketData;
  chartData: ChartDataPoint[] | null;
  currentPrice: number;
  priceChange: number;
  activeTimeframe: TimeframeOption;
  isLoading: boolean;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  onRefresh: () => void;
}

const ChartCard = ({ 
  marketData, 
  chartData, 
  currentPrice, 
  priceChange, 
  activeTimeframe, 
  isLoading, 
  onTimeframeChange, 
  onRefresh 
}: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (chartData) {
      drawChart(chartData);
    }
  }, [chartData, activeTimeframe]);
  
  useEffect(() => {
    if (chartData) {
      const handleResize = () => drawChart(chartData);
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [chartData]);
  
  const drawChart = (data: ChartDataPoint[]) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth || 800;
      canvas.height = parent.clientHeight || 360;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      drawGrid(ctx, canvas.width, canvas.height);
      
      // Draw candlestick chart
      drawCandlestickChart(ctx, data, canvas.width, canvas.height);
      
    } catch (error) {
      console.error("Error drawing chart:", error);
    }
  };
  
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 1; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 1; i < 6; i++) {
      const x = (width / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };
  
  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D, 
    data: ChartDataPoint[], 
    width: number, 
    height: number
  ) => {
    if (!data || data.length === 0) return;
    
    // Find min/max for scaling
    let minPrice = Math.min(...data.map(d => d.low));
    let maxPrice = Math.max(...data.map(d => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);
    
    // Scale Y values
    const scaleY = (value: number) => height - ((value - minPrice) / (maxPrice - minPrice || 1)) * height;
    
    // Candle dimensions
    const candleWidth = Math.min(16, width / Math.max(1, data.length) * 0.8);
    const candleSpacing = width / Math.max(1, data.length);
    
    // Draw line connecting closes
    ctx.beginPath();
    ctx.moveTo(candleSpacing/2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0) ctx.lineTo((i * candleSpacing) + (candleSpacing/2), scaleY(candle.close));
    });
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw candles
    data.forEach((candle, i) => {
      const x = (i * candleSpacing) + (candleSpacing/2) - (candleWidth/2);
      const isUp = candle.close >= candle.open;
      const color = isUp ? '#4CAF50' : '#EF5350';
      const fillColor = isUp ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 83, 80, 0.3)';
      
      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + (candleWidth/2), scaleY(candle.high));
      ctx.lineTo(x + (candleWidth/2), scaleY(candle.low));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw body
      const openY = scaleY(candle.open);
      const closeY = scaleY(candle.close);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      const bodyY = Math.min(openY, closeY);
      
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = color;
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
      ctx.strokeRect(x, bodyY, candleWidth, bodyHeight);
    });
    
    // Draw price labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + ((maxPrice - minPrice) * (i / 5));
      ctx.fillText(`${Math.round(price * 100)}%`, width - 10, scaleY(price) + 4);
    }
    
    // Draw time labels
    ctx.textAlign = 'center';
    const steps = Math.min(6, data.length);
    for (let i = 0; i < steps; i++) {
      const dataIndex = Math.floor((i / (steps - 1)) * (data.length - 1));
      const x = (dataIndex / (data.length - 1)) * width;
      const date = new Date(data[dataIndex].time);
      const timeLabel = activeTimeframe === '1H' || activeTimeframe === '6H' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillText(timeLabel, x, height - 10);
    }
  };
  
  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0d1117] shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
            <span className="text-black font-bold">{marketData.category.substring(0, 1)}</span>
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">{marketData.name}</h1>
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">YES</span>
            </div>
            <div className="text-[#888] text-sm flex items-center">
              <span>Volume: {marketData.volume}</span>
              <span className="mx-2">•</span>
              <span>Ending: {marketData.endDate}</span>
            </div>
          </div>
        </div>
        
        {/* Timeframe selector */}
        <TimeframeSelector
          activeTimeframe={activeTimeframe}
          onTimeframeChange={onTimeframeChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </div>
      
      {/* Price info */}
      <div className="px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">{Math.round(currentPrice * 100)}%</span>
          <span className={`ml-2 flex items-center ${parseFloat(priceChange.toString()) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(priceChange.toString()) >= 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
            {Math.abs(parseFloat(priceChange.toFixed(1)))}%
          </span>
          <span className="ml-3 text-[#888] text-sm px-2 py-1 bg-[#171c21] rounded-md">
            Odds: {calculateOdds(true, marketData)}
          </span>
        </div>
        <div className="text-[#888] text-sm">
          24h High: 58% • Low: 49%
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[360px] relative px-2 pb-4 pt-2">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0d1117]/80 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default ChartCard;