import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, Info, RefreshCw } from "lucide-react";
import type { Market, ChartDataPoint, TimeframeOption } from "../lib/interface";
import { calculateOdds, generateChartData } from "../utils/calculations";
import { getTimeLeft } from "../utils/helpers";

interface ChartCardProps {
  marketData: Market;
  marketId: string;
  chartData: ChartDataPoint[] | null;
  currentPrice: number;
  priceChange: number;
  activeTimeframe: TimeframeOption;
  isLoading: boolean;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  onRefresh: () => void;
}

// Self-contained component that manages its own chart data
const ChartCard = ({ marketData, marketId }: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>("1D");
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(1);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    price: number;
    time: Date;
    index: number;
  } | null>(null);
  const [chartMetrics, setChartMetrics] = useState<{
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    volume: number;
  } | null>(null);

  // Fetch chart data directly in the component
  const fetchChartData = useCallback(() => {
    try {
      setIsLoading(true);

      // Generate chart data based on timeframe and market ID
      const data = generateChartData(activeTimeframe, marketId);

      // Calculate chart metrics
      const closes = data.map((d) => d.close);
      const volumes = data.map(
        (_, i) => Math.random() * 100 * (1 + Math.sin(i / 10)) // Simulated volume data
      );

      const metrics = {
        minPrice: Math.min(...closes),
        maxPrice: Math.max(...closes),
        avgPrice: closes.reduce((sum, price) => sum + price, 0) / closes.length,
        volume: volumes.reduce((sum, vol) => sum + vol, 0),
      };

      // Set the new data and price information
      setChartData(data);
      setCurrentPrice(data[data.length - 1].close);

      // Calculate price change (last day)
      const lastIndex = data.length - 1;
      const prevIndex = Math.max(
        0,
        lastIndex - (activeTimeframe === "1D" ? 24 : 1)
      );
      const change =
        ((data[lastIndex].close - data[prevIndex].close) /
          data[prevIndex].close) *
        100;
      setPriceChange(change);

      setChartMetrics(metrics);
      setIsLoading(false);
    } catch (err) {
      console.error("Error generating chart data:", err);
      setIsLoading(false);
    }
  }, [activeTimeframe, marketId]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setActiveTimeframe(timeframe);
  };

  // Handle chart refresh
  const refreshChart = () => {
    fetchChartData();
  };

  // Initialize chart data on mount and when timeframe changes
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    if (chartData) {
      drawChart(chartData);
    }
  }, [chartData, activeTimeframe, hoveredPoint]);

  useEffect(() => {
    if (chartData) {
      const handleResize = () => drawChart(chartData);
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, [chartData]);

  const setupMouseTracking = (
    canvas: HTMLCanvasElement,
    data: ChartDataPoint[]
  ) => {
    // Find min/max for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values
    const scaleY = (value: number) =>
      canvas.height -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * canvas.height;

    // Candle dimensions
    const candleSpacing = canvas.width / Math.max(1, data.length);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Find the closest data point
      const index = Math.min(
        data.length - 1,
        Math.max(0, Math.floor(x / candleSpacing))
      );

      const dataPoint = data[index];
      const pointX = index * candleSpacing + candleSpacing / 2;
      const pointY = scaleY(dataPoint.close);

      setHoveredPoint({
        x: pointX,
        y: pointY,
        price: dataPoint.close,
        time: new Date(dataPoint.time),
        index,
      });
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  };

  const drawChart = (data: ChartDataPoint[]) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth || 800;
      canvas.height = parent.clientHeight || 360;

      // Set up mouse tracking for tooltips
      setupMouseTracking(canvas, data);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw custom background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#0d1117");
      bgGradient.addColorStop(1, "#090c10");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw volume bars
      drawVolumeChart(ctx, data, canvas.width, canvas.height);

      // Draw candlestick chart
      drawCandlestickChart(ctx, data, canvas.width, canvas.height);

      // Draw trend line (moving average)
      drawTrendLine(ctx, data, canvas.width, canvas.height);

      // Draw current price indicator
      drawCurrentPriceIndicator(
        ctx,
        currentPrice,
        canvas.width,
        canvas.height,
        data
      );
    } catch (error) {
      console.error("Error drawing chart:", error);
    }
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
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

  const drawVolumeChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartDataPoint[],
    width: number,
    height: number
  ) => {
    if (!data || data.length === 0) return;

    // Volume bars take up the bottom 15% of the chart
    const volumeHeight = height * 0.15;
    const volumeTop = height * 0.85;

    // Generate mock volume data
    const volumes = data.map(
      (_, i) => Math.random() * 100 * (1 + Math.sin(i / 10))
    );

    const maxVolume = Math.max(...volumes);

    // Candle dimensions
    const barWidth = Math.min(10, (width / Math.max(1, data.length)) * 0.8);
    const barSpacing = width / Math.max(1, data.length);

    // Draw volume bars
    volumes.forEach((volume, i) => {
      const x = i * barSpacing + barSpacing / 2 - barWidth / 2;
      const barHeight = (volume / maxVolume) * volumeHeight;

      // Color based on price movement
      const isUp = i > 0 ? data[i].close >= data[i - 1].close : true;
      const color = isUp ? "rgba(76, 175, 80, 0.3)" : "rgba(239, 83, 80, 0.3)";

      ctx.fillStyle = color;
      ctx.fillRect(
        x,
        volumeTop + (volumeHeight - barHeight),
        barWidth,
        barHeight
      );
    });

    // Draw subtle volume label
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Volume", 5, volumeTop + 12);
  };

  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartDataPoint[],
    width: number,
    height: number
  ) => {
    if (!data || data.length === 0) return;

    // Price chart takes up the top 85% of chart area
    const chartHeight = height * 0.85;

    // Find min/max for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    // Candle dimensions
    const candleWidth = Math.min(16, (width / Math.max(1, data.length)) * 0.8);
    const candleSpacing = width / Math.max(1, data.length);

    // Draw area chart under the line for visual enhancement
    ctx.beginPath();
    ctx.moveTo(candleSpacing / 2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0)
        ctx.lineTo(i * candleSpacing + candleSpacing / 2, scaleY(candle.close));
    });
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();

    // Create gradient fill for area
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, "rgba(255, 112, 67, 0.15)");
    gradient.addColorStop(1, "rgba(255, 112, 67, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line connecting closes with enhanced styling
    ctx.beginPath();
    ctx.moveTo(candleSpacing / 2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0)
        ctx.lineTo(i * candleSpacing + candleSpacing / 2, scaleY(candle.close));
    });

    // Create gradient for the line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, "rgba(255, 112, 67, 0.8)");
    lineGradient.addColorStop(1, "rgba(255, 149, 0, 0.8)");

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw candles
    data.forEach((candle, i) => {
      const x = i * candleSpacing + candleSpacing / 2 - candleWidth / 2;
      const isUp = candle.close >= candle.open;
      const color = isUp ? "#4CAF50" : "#EF5350";
      const fillColor = isUp
        ? "rgba(76, 175, 80, 0.3)"
        : "rgba(239, 83, 80, 0.3)";

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, scaleY(candle.high));
      ctx.lineTo(x + candleWidth / 2, scaleY(candle.low));
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

      // Highlight hovered candle
      if (hoveredPoint && hoveredPoint.index === i) {
        ctx.fillStyle = isUp
          ? "rgba(76, 175, 80, 0.5)"
          : "rgba(239, 83, 80, 0.5)";
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
        ctx.strokeStyle = isUp ? "#4CAF50" : "#EF5350";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, bodyY, candleWidth, bodyHeight);
      }
    });

    // Draw price labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (maxPrice - minPrice) * (i / 5);
      ctx.fillText(
        `${Math.round(price * 100)}%`,
        width - 10,
        scaleY(price) + 4
      );
    }

    // Draw time labels
    ctx.textAlign = "center";
    const steps = Math.min(6, data.length);
    for (let i = 0; i < steps; i++) {
      const dataIndex = Math.floor((i / (steps - 1)) * (data.length - 1));
      const x = (dataIndex / (data.length - 1)) * width;
      const date = new Date(data[dataIndex].time);
      const timeLabel =
        activeTimeframe === "1H" || activeTimeframe === "6H"
          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleDateString([], { month: "short", day: "numeric" });
      ctx.fillText(timeLabel, x, height - 10);
    }

    // If there's a hovered point, draw the crosshair and tooltip
    if (hoveredPoint) {
      drawCrosshair(ctx, hoveredPoint.x, hoveredPoint.y, width, chartHeight);
      drawTooltip(ctx, hoveredPoint, width, chartHeight);
    }
  };

  const drawTrendLine = (
    ctx: CanvasRenderingContext2D,
    data: ChartDataPoint[],
    width: number,
    height: number
  ) => {
    if (!data || data.length < 10) return;

    // Chart height is top 85% of total height
    const chartHeight = height * 0.85;

    // Calculate simple moving average (10 periods)
    const period = 10;
    const sma: { time: number; value: number }[] = [];

    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push({
        time: data[i].time,
        value: sum / period,
      });
    }

    // Find min/max for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    // Candle dimensions
    const candleSpacing = width / Math.max(1, data.length);

    // Draw SMA line
    ctx.beginPath();
    const startIndex = period - 1;
    ctx.moveTo(
      startIndex * candleSpacing + candleSpacing / 2,
      scaleY(sma[0].value)
    );

    sma.forEach((point, i) => {
      if (i > 0) {
        const x = (i + startIndex) * candleSpacing + candleSpacing / 2;
        ctx.lineTo(x, scaleY(point.value));
      }
    });

    ctx.strokeStyle = "rgba(133, 196, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Add SMA label
    ctx.fillStyle = "rgba(133, 196, 255, 0.8)";
    ctx.font = "11px Arial";
    ctx.textAlign = "left";
    ctx.fillText("SMA (10)", 10, 20);
  };

  const drawCrosshair = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  };

  const drawTooltip = (
    ctx: CanvasRenderingContext2D,
    point: {
      x: number;
      y: number;
      price: number;
      time: Date;
      index: number;
    },
    width: number,
    height: number
  ) => {
    const tooltipWidth = 120;
    const tooltipHeight = 60;
    const padding = 8;

    // Determine tooltip position to keep it in bounds
    let tooltipX = point.x + 15;
    if (tooltipX + tooltipWidth > width) {
      tooltipX = point.x - tooltipWidth - 15;
    }

    let tooltipY = point.y - tooltipHeight / 2;
    if (tooltipY < 0) {
      tooltipY = 0;
    } else if (tooltipY + tooltipHeight > height) {
      tooltipY = height - tooltipHeight;
    }

    // Draw tooltip background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Format time and price for display
    const formattedTime =
      activeTimeframe === "1H" || activeTimeframe === "6H"
        ? point.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : point.time.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          }) +
          " " +
          point.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

    const formattedPrice = `${(point.price * 100).toFixed(2)}%`;

    // Draw tooltip text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Price:", tooltipX + padding, tooltipY + padding + 14);
    ctx.fillText("Time:", tooltipX + padding, tooltipY + padding + 34);

    ctx.fillStyle = "rgba(255, 180, 100, 1)";
    ctx.textAlign = "right";
    ctx.fillText(
      formattedPrice,
      tooltipX + tooltipWidth - padding,
      tooltipY + padding + 14
    );
    ctx.fillText(
      formattedTime,
      tooltipX + tooltipWidth - padding,
      tooltipY + padding + 34
    );
  };

  const drawCurrentPriceIndicator = (
    ctx: CanvasRenderingContext2D,
    price: number,
    width: number,
    height: number,
    data: ChartDataPoint[]
  ) => {
    // Chart height is top 85% of total height
    const chartHeight = height * 0.85;

    // Find min/max for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    const y = scaleY(price);

    // Draw dashed line
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = "rgba(255, 112, 67, 0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw price label with background
    const labelText = `${(price * 100).toFixed(2)}%`;
    const labelWidth = ctx.measureText(labelText).width + 16;

    ctx.fillStyle = "rgba(255, 112, 67, 0.9)";
    ctx.beginPath();
    ctx.roundRect(width - labelWidth - 5, y - 10, labelWidth, 20, 4);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(labelText, width - labelWidth / 2 - 5, y + 4);
  };

  // Custom timeframe selector component to avoid external dependencies
  const TimeframeSelector = () => {
    const timeframes: TimeframeOption[] = ["1H", "6H", "1D", "1W", "1M", "6M"];

    return (
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <div className="flex bg-[#171c21] rounded-md p-1 flex-1 sm:flex-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1.5 text-sm rounded transition-all flex-1 ${
                activeTimeframe === tf
                  ? "bg-[#2c3136] text-white"
                  : "text-[#888] hover:text-[#bbb] hover:bg-[#1f2429]"
              }`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        <button
          onClick={refreshChart}
          disabled={isLoading}
          className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
        {/* <button className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors">
          <Settings size={16} />
        </button> */}
      </div>
    );
  };

  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-gradient-to-b from-[#111] to-[#0a0a0a] shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <img src={marketData.image} alt={marketData.question} />
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                {marketData.question}
              </h1>
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                YES
              </span>
            </div>
            <div className="text-[#888] text-sm flex items-center">
              <span>Volume: 200K</span>
              <span className="mx-2">•</span>
              <span>
                <span className="text-red-500">Ending:</span>{" "}
                {getTimeLeft(marketData.expiry_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <TimeframeSelector />
      </div>

      {/* Price info */}
      <div className="px-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(currentPrice * 100)}%
          </span>
          <span
            className={`ml-2 flex items-center ${
              priceChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceChange >= 0 ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            {Math.abs(parseFloat(priceChange.toFixed(1)))}%
          </span>
          <span className="ml-3 text-[#888] text-sm px-2 py-1 bg-[#171c21] rounded-md">
            Odds: {calculateOdds(marketData)}
          </span>
        </div>

        {/* Chart metrics */}
        {chartMetrics && (
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-[#888]">High:</span>
              <span className="text-green-500 font-medium">
                {(chartMetrics.maxPrice * 100).toFixed(1)}%
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#888]">Low:</span>
              <span className="text-red-500 font-medium">
                {(chartMetrics.minPrice * 100).toFixed(1)}%
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#888]">Avg:</span>
              <span className="text-blue-400 font-medium">
                {(chartMetrics.avgPrice * 100).toFixed(1)}%
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Trading activity summary */}
      <div className="px-5 pt-2 pb-2">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-[#171c21] rounded p-2">
            <div className="text-[#888] mb-1">24h Trades</div>
            <div className="text-white font-bold">
              {Math.floor(Math.random() * 1000) + 200}
            </div>
          </div>
          <div className="bg-[#171c21] rounded p-2">
            <div className="text-[#888] mb-1">Daily Volume</div>
            <div className="text-white font-bold">
              ${(Math.random() * 250000 + 50000).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#171c21] rounded p-2">
            <div className="text-[#888] mb-1">Forecasters</div>
            <div className="text-white font-bold">
              {Math.floor(Math.random() * 500) + 100}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px] relative px-2 pb-4 pt-2">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0d1117]/80 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        {/* Chart info tooltip */}
        <div className="absolute top-2 right-2 group">
          <button className="p-1 rounded-full bg-[#171c21] text-[#888] hover:text-white transition-colors">
            <Info size={14} />
          </button>
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#171c21] p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-[#ccc] z-20">
            <p className="mb-1">
              Chart shows price probability over time. Hover for details.
            </p>
            <p>Blue line represents 10-period moving average.</p>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="px-5 py-3 border-t border-[#222]">
        <h3 className="text-sm font-medium text-white mb-2">Price History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#888] border-b border-[#222]">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Open</th>
                <th className="text-right py-2">High</th>
                <th className="text-right py-2">Low</th>
                <th className="text-right py-2">Close</th>
                <th className="text-right py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {chartData &&
                chartData
                  .slice(-5)
                  .reverse()
                  .map((point, i) => {
                    const date = new Date(point.time);
                    const prevPoint =
                      i < 4 ? chartData[chartData.length - 5 + i + 1] : null;
                    const change = prevPoint
                      ? ((point.close - prevPoint.close) / prevPoint.close) *
                        100
                      : 0;

                    return (
                      <tr
                        key={i}
                        className="border-b border-[#222]/50 hover:bg-[#171c21]"
                      >
                        <td className="py-2 text-left">
                          {date.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {(point.open * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 text-right">
                          {(point.high * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 text-right">
                          {(point.low * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 text-right font-medium">
                          {(point.close * 100).toFixed(2)}%
                        </td>
                        <td
                          className={`py-2 text-right ${
                            change >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;