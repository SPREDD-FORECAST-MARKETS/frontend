import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, Info, TrendingUp, TrendingDown } from "lucide-react";
import type { ChartDataPoint, Market } from "../lib/interface";

interface ChartCardProps {
  marketData: Market;
  marketId: string;
}

interface TimeframeOption {
  value: string;
  label: string;
}

interface HoveredPoint {
  x: number;
  y: number;
  price: number;
  time: Date;
  index: number;
  volume: number;
}

interface ChartStats {
  high: number;
  low: number;
  avg: number;
  totalVolume: number;
  trades: number;
}

interface ChartPadding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

type ViewType = "YES" | "NO";

const ChartCard: React.FC<ChartCardProps> = ({ marketData, marketId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1m");
  const [activeView, setActiveView] = useState<ViewType>("YES");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0.5);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hoveredPoint, ] = useState<HoveredPoint | null>(null);

  const timeframeOptions: TimeframeOption[] = [
    { value: "10s", label: "10s" },
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "1h", label: "1h" },
    { value: "1d", label: "1d" },
    { value: "1mo", label: "1mo" }
  ];

  const fetchChartData = useCallback(async (showLoader: boolean = true): Promise<void> => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

      const response: Response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/market/chart?marketId=${marketId}&interval=${activeTimeframe}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      // Handle empty data
      if (data.length === 0) {
        setChartData([]);
        setCurrentPrice(0.5);
        setPriceChange(0);
        if (showLoader) {
          setIsLoading(false);
        }
        setLastRefresh(new Date());
        return;
      }

      // Transform API data to our format with validation
      const transformedData: ChartDataPoint[] = data
        .filter((item: any) => item && item.bucket) // Filter out invalid items
        .map((item: any): ChartDataPoint => ({
          time: item.bucket,
          yesOdds: Math.max(0, Math.min(1, parseInt(item.yesOdds || "0") / 1000000)), // Clamp between 0-1
          noOdds: Math.max(0, Math.min(1, parseInt(item.noOdds || "0") / 1000000)),
          totalVolume: parseInt(item.totalVolume || "0")
        }));

      if (transformedData.length === 0) {
        throw new Error("No valid data points found");
      }

      setChartData(transformedData);

      // Calculate current price and price change
      const latestData: ChartDataPoint = transformedData[transformedData.length - 1];
      const currentOdds: number = activeView === "YES" ? latestData.yesOdds : latestData.noOdds;
      setCurrentPrice(currentOdds);

      // Calculate price change from first to last data point
      if (transformedData.length > 1) {
        const firstOdds: number = activeView === "YES"
          ? transformedData[0].yesOdds
          : transformedData[0].noOdds;
        const change: number = firstOdds > 0 ? ((currentOdds - firstOdds) / firstOdds) * 100 : 0;
        setPriceChange(change);
      } else {
        setPriceChange(0);
      }

      if (showLoader) {
        setIsLoading(false);
      }
      setLastRefresh(new Date()); // Update last refresh time
    } catch (err: unknown) {
      console.error("Error fetching chart data:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart data");
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [marketId, activeTimeframe, activeView]);

  useEffect(() => {
    // Initial load with loader
    fetchChartData(true);

    // Set up auto-refresh every 10 seconds (background refresh without loader)
    const refreshInterval = setInterval(() => {
      fetchChartData(false);
    }, 10000);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchChartData]);

  useEffect(() => {
    if (chartData.length > 0) {
      drawChart();
    }
  }, [chartData, activeView, hoveredPoint]);

  const drawChart = (): void => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;

    const parent: HTMLElement | null = canvas.parentElement;
    if (!parent) return;

    // Add padding to prevent overflow
    const padding: number = 40;
    canvas.width = Math.max(400, parent.clientWidth - padding);
    canvas.height = Math.max(200, parent.clientHeight - padding);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background - matching the site's #131314 color
    ctx.fillStyle = "#131314";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);
    drawPriceLine(ctx, canvas.width, canvas.height);
    drawVolumeIndicators(ctx, canvas.width, canvas.height);

    if (hoveredPoint) {
      drawCrosshair(ctx, hoveredPoint.x, hoveredPoint.y, canvas.width, canvas.height);
      drawTooltip(ctx, hoveredPoint, canvas.width, canvas.height);
    }

  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const chartPadding = {
      left: 60,
      right: 60,
      top: 20,
      bottom: 40
    };

    const chartWidth = width - chartPadding.left - chartPadding.right;
    const chartHeight = height - chartPadding.top - chartPadding.bottom;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
      const y = chartPadding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(chartPadding.left, y);
      ctx.lineTo(width - chartPadding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 1; i < 5; i++) {
      const x = chartPadding.left + (chartWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartPadding.top);
      ctx.lineTo(x, height - chartPadding.bottom);
      ctx.stroke();
    }
  };

  const drawPriceLine = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
    if (chartData.length === 0) return;

    const data: number[] = chartData.map((d: ChartDataPoint) => activeView === "YES" ? d.yesOdds : d.noOdds);
    const minPrice: number = Math.min(...data);
    const maxPrice: number = Math.max(...data);
    const padding: number = Math.max(0.05, (maxPrice - minPrice) * 0.15); // Minimum padding
    const adjustedMin: number = Math.max(0, minPrice - padding);
    const adjustedMax: number = Math.min(1, maxPrice + padding);

    // Add chart padding
    const chartPadding: ChartPadding = {
      left: 60,
      right: 60,
      top: 20,
      bottom: 40
    };

    const chartWidth: number = width - chartPadding.left - chartPadding.right;
    const chartHeight: number = height - chartPadding.top - chartPadding.bottom;

    const scaleY = (value: number): number =>
      chartPadding.top + chartHeight - ((value - adjustedMin) / (adjustedMax - adjustedMin || 1)) * chartHeight;

    const scaleX = (index: number): number =>
      chartPadding.left + (chartData.length > 1 ? (index / (chartData.length - 1)) * chartWidth : chartWidth / 2);

    // Draw area under the curve
    if (data.length > 0) {
      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(data[0]));
      data.forEach((price: number, i: number) => {
        ctx.lineTo(scaleX(i), scaleY(price));
      });
      ctx.lineTo(scaleX(data.length - 1), height - chartPadding.bottom);
      ctx.lineTo(scaleX(0), height - chartPadding.bottom);
      ctx.closePath();

      const areaGradient: CanvasGradient = ctx.createLinearGradient(0, chartPadding.top, 0, height - chartPadding.bottom);
      const color: string = activeView === "YES" ? "34, 197, 94" : "239, 68, 68";
      areaGradient.addColorStop(0, `rgba(${color}, 0.15)`);
      areaGradient.addColorStop(1, `rgba(${color}, 0.02)`);
      ctx.fillStyle = areaGradient;
      ctx.fill();
    }

    // Draw the main line
    if (data.length > 1) {
      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(data[0]));
      data.forEach((price: number, i: number) => {
        if (i > 0) {
          ctx.lineTo(scaleX(i), scaleY(price));
        }
      });

      ctx.strokeStyle = activeView === "YES" ? "#22c55e" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw data points
    data.forEach((price: number, i: number) => {
      const x: number = scaleX(i);
      const y: number = scaleY(price);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = activeView === "YES" ? "#22c55e" : "#ef4444";
      ctx.fill();

      if (hoveredPoint && hoveredPoint.index === i) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = activeView === "YES" ? "#22c55e" : "#ef4444";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw Y-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const price: number = adjustedMin + (adjustedMax - adjustedMin) * (i / 5);
      const y: number = scaleY(price);
      ctx.fillText(
        `${Math.round(price * 100)}%`,
        chartPadding.left - 12,
        y + 3
      );
    }

    // Draw X-axis labels - with proper bounds checking
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    const labelCount: number = Math.min(5, chartData.length);
    if (labelCount > 0) {
      for (let i = 0; i < labelCount; i++) {
        const dataIndex: number = labelCount === 1 ? 0 : Math.floor((i / (labelCount - 1)) * (chartData.length - 1));
        // Ensure dataIndex is within bounds
        if (dataIndex >= 0 && dataIndex < chartData.length && chartData[dataIndex]) {
          const x: number = scaleX(dataIndex);
          const date: Date = new Date(chartData[dataIndex].time);
          if (!isNaN(date.getTime())) { // Check if date is valid
            const timeLabel: string = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });
            ctx.fillText(timeLabel, x, height - chartPadding.bottom + 18);
          }
        }
      }
    }
  };

  const drawVolumeIndicators = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
    if (chartData.length === 0) return;

    const volumes: number[] = chartData.map((d: ChartDataPoint) => d.totalVolume);
    const maxVolume: number = Math.max(...volumes);
    if (maxVolume === 0) return;

    const chartPadding: ChartPadding = {
      left: 60,
      right: 60,
      top: 20,
      bottom: 40
    };

    const chartWidth: number = width - chartPadding.left - chartPadding.right;

    const scaleX = (index: number): number =>
      chartPadding.left + (chartData.length > 1 ? (index / (chartData.length - 1)) * chartWidth : chartWidth / 2);

    chartData.forEach((point: ChartDataPoint, i: number) => {
      const x: number = scaleX(i);
      const volumeHeight: number = (point.totalVolume / maxVolume) * 12;

      ctx.fillStyle = "rgba(156, 163, 175, 0.3)";
      ctx.fillRect(x - 1.5, height - chartPadding.bottom + 5, 3, volumeHeight);
    });
  };

  const drawCrosshair = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const chartPadding = {
      left: 60,
      right: 60,
      top: 20,
      bottom: 40
    };

    ctx.beginPath();
    ctx.moveTo(x, chartPadding.top);
    ctx.lineTo(x, height - chartPadding.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chartPadding.left, y);
    ctx.lineTo(width - chartPadding.right, y);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const drawTooltip = (
    ctx: CanvasRenderingContext2D,
    point: {
      x: number;
      y: number;
      price: number;
      time: Date;
      volume: number;
    },
    width: number,
    height: number
  ) => {
    const tooltipWidth = 160;
    const tooltipHeight = 90;
    const padding = 12;

    let tooltipX = point.x + 20;
    if (tooltipX + tooltipWidth > width) {
      tooltipX = point.x - tooltipWidth - 20;
    }

    let tooltipY = point.y - tooltipHeight / 2;
    if (tooltipY < 0) tooltipY = 0;
    if (tooltipY + tooltipHeight > height) tooltipY = height - tooltipHeight;

    // Background
    ctx.fillStyle = "rgba(15, 20, 25, 0.95)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Content
    const formattedTime = point.time.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const formattedPrice = `${(point.price * 100).toFixed(1)}%`;
    const formattedVolume = point.volume > 1000
      ? `$${(point.volume / 1000000).toFixed(1)}M`
      : `$${point.volume.toLocaleString()}`;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";

    ctx.fillText(`${activeView} Price:`, tooltipX + padding, tooltipY + padding + 16);
    ctx.fillText("Time:", tooltipX + padding, tooltipY + padding + 36);
    ctx.fillText("Volume:", tooltipX + padding, tooltipY + padding + 56);

    ctx.fillStyle = activeView === "YES" ? "#00C896" : "#FF5064";
    ctx.textAlign = "right";
    ctx.fillText(formattedPrice, tooltipX + tooltipWidth - padding, tooltipY + padding + 16);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(formattedTime, tooltipX + tooltipWidth - padding, tooltipY + padding + 36);
    ctx.fillText(formattedVolume, tooltipX + tooltipWidth - padding, tooltipY + padding + 56);
  };

  const calculateStats = (): ChartStats | null => {
    if (chartData.length === 0) return null;

    const prices: number[] = chartData.map((d: ChartDataPoint) => activeView === "YES" ? d.yesOdds : d.noOdds);
    const volumes: number[] = chartData.map((d: ChartDataPoint) => d.totalVolume);

    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      avg: prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length,
      totalVolume: volumes.reduce((sum: number, vol: number) => sum + vol, 0),
      trades: chartData.length
    };
  };

  function formatVolume(raw: number | string | bigint) {
    const amount =
      typeof raw === "bigint"
        ? Number(raw) / 1e6
        : typeof raw === "string"
          ? parseFloat(raw) / 1e6
          : raw / 1e6;

    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  const stats: ChartStats | null = calculateStats();

  return (
    <div className="bg-[#131314] border border-white/5 rounded-xl shadow-lg overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {marketData?.question || `Market ${marketId}`}
            </h3>
            <p className="text-slate-400 text-sm">
              {marketData?.description || "Prediction Market"}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setActiveView("YES")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === "YES"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <TrendingUp size={14} className="inline mr-1" />
                YES
              </button>
              <button
                onClick={() => setActiveView("NO")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === "NO"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <TrendingDown size={14} className="inline mr-1" />
                NO
              </button>
            </div>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="flex flex-wrap gap-2 mt-4">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveTimeframe(option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTimeframe === option.value
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={() => fetchChartData(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all ml-auto border border-white/10"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Price Info */}
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-white">
            {Math.round(currentPrice * 100)}%
          </span>
          <span className={`flex items-center font-semibold text-sm ${priceChange >= 0 ? "text-green-400" : "text-red-400"
            }`}>
            {priceChange >= 0 ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            {Math.abs(priceChange).toFixed(1)}%
          </span>
          <span className="text-slate-400 text-xs px-2 py-1 bg-white/5 rounded-md font-medium border border-white/10">
            {activeView} Odds
          </span>
        </div>

        {stats && (
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1">
              <span className="text-slate-500">High:</span>
              <span className="text-green-400">{(stats.high * 100).toFixed(1)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">Low:</span>
              <span className="text-red-400">{(stats.low * 100).toFixed(1)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">Avg:</span>
              <span className="text-amber-400">{(stats.avg * 100).toFixed(1)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">Updated:</span>
              <span className="text-slate-400">
                {lastRefresh.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Trading Stats */}
      {stats && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-slate-500 mb-1 font-medium text-xs">Data Points</div>
              <div className="text-white font-semibold">{stats.trades}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-slate-500 mb-1 font-medium text-xs">Total Volume</div>
              <div className="text-white font-semibold">
                {formatVolume(stats.totalVolume)}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-slate-500 mb-1 font-medium text-xs">Timeframe</div>
              <div className="text-white font-semibold">{activeTimeframe}</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-[300px] relative px-6 pb-6">
        {isLoading && (
          <div className="absolute inset-4 bg-black/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-slate-300 text-sm">Loading chart data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-4 bg-black/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-red-400 text-center">
              <p className="font-semibold mb-2">Error loading chart data</p>
              <p className="text-sm text-slate-400 mb-4">{error}</p>
              <button
                onClick={() => fetchChartData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && chartData.length === 0 && (
          <div className="absolute inset-4 bg-black/50 flex items-center justify-center z-10 rounded-lg">
            <div className="text-slate-400 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp size={24} className="text-slate-500" />
              </div>
              <p className="font-semibold mb-2">No Data Available</p>
              <p className="text-sm text-slate-500 mb-4">
                No trading data found for this timeframe
              </p>
              <button
                onClick={() => fetchChartData(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair rounded-lg"
          style={{
            display: (!isLoading && !error && chartData.length > 0) ? 'block' : 'none'
          }}
        />

        {/* Chart Info */}
        {chartData.length > 0 && (
          <div className="absolute top-4 right-4 group">
            <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-slate-300 transition-colors border border-white/10">
              <Info size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#131314] border border-white/10 p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-slate-400 z-20">
              <p className="mb-2 font-medium text-slate-300">
                Shows {activeView} probability over time
              </p>
              <p className="text-orange-400 font-medium">
                Auto-refreshes every 10 seconds
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;