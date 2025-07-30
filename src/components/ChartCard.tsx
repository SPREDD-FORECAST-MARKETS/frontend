import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import type { Market, ChartDataPoint, TimeframeOption } from "../lib/interface";
import { calculateOdds, generateChartData } from "../utils/calculations";

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

// A self-contained component that manages its own chart data
const ChartCard = ({ marketData, marketId }: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe,] = useState<TimeframeOption>("1D");
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

  // Fetch chart data directly within the component
  const fetchChartData = useCallback(() => {
    try {
      setIsLoading(true);

      // Generate chart data based on the selected timeframe and market ID
      const data = generateChartData(activeTimeframe, marketId);

      // Calculate chart metrics from the generated data
      const closes = data.map((d) => d.close);
      const volumes = data.map(
        (_, i) => Math.random() * 100 * (1 + Math.sin(i / 10)) // Simulated volume
      );

      const metrics = {
        minPrice: Math.min(...closes),
        maxPrice: Math.max(...closes),
        avgPrice: closes.reduce((sum, price) => sum + price, 0) / closes.length,
        volume: volumes.reduce((sum, vol) => sum + vol, 0),
      };

      // Update the state with new data and price information
      setChartData(data);
      setCurrentPrice(data[data.length - 1].close);

      // Calculate the price change (for the last day)
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


  // Initialize and update chart data when the component mounts or timeframe changes
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
    // Determine min/max prices for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values to fit the canvas height
    const scaleY = (value: number) =>
      canvas.height -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * canvas.height;

    // Define candle dimensions
    const candleSpacing = canvas.width / Math.max(1, data.length);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Find the closest data point to the mouse position
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

      // Draw a custom background with a gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#1a1f27");
      bgGradient.addColorStop(1, "#11151a");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw volume bars
      drawVolumeChart(ctx, data, canvas.width, canvas.height);

      // Draw the candlestick chart
      drawCandlestickChart(ctx, data, canvas.width, canvas.height);

      // Draw the trend line (moving average)
      drawTrendLine(ctx, data, canvas.width, canvas.height);

      // Draw the current price indicator
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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let i = 1; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw vertical grid lines
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

    // Volume bars occupy the bottom 15% of the chart
    const volumeHeight = height * 0.15;
    const volumeTop = height * 0.85;

    // Generate mock volume data for visualization
    const volumes = data.map(
      (_, i) => Math.random() * 100 * (1 + Math.sin(i / 10))
    );

    const maxVolume = Math.max(...volumes);

    // Define bar dimensions
    const barWidth = Math.min(10, (width / Math.max(1, data.length)) * 0.8);
    const barSpacing = width / Math.max(1, data.length);

    // Draw individual volume bars
    volumes.forEach((volume, i) => {
      const x = i * barSpacing + barSpacing / 2 - barWidth / 2;
      const barHeight = (volume / maxVolume) * volumeHeight;

      // Color bars based on price movement
      const isUp = i > 0 ? data[i].close >= data[i - 1].close : true;
      const color = isUp ? "rgba(0, 200, 150, 0.4)" : "rgba(255, 80, 100, 0.4)";

      ctx.fillStyle = color;
      ctx.fillRect(
        x,
        volumeTop + (volumeHeight - barHeight),
        barWidth,
        barHeight
      );
    });

    // Add a subtle label for the volume section
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Volume", 10, volumeTop + 15);
  };

  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartDataPoint[],
    width: number,
    height: number
  ) => {
    if (!data || data.length === 0) return;

    // The price chart occupies the top 85% of the canvas
    const chartHeight = height * 0.85;

    // Determine min/max prices for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.15; // Increased padding
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values to fit the chart area
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    // Define candle dimensions
    const candleWidth = Math.min(16, (width / Math.max(1, data.length)) * 0.7);
    const candleSpacing = width / Math.max(1, data.length);

    // Create a visually appealing area chart beneath the line
    ctx.beginPath();
    ctx.moveTo(candleSpacing / 2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0)
        ctx.lineTo(i * candleSpacing + candleSpacing / 2, scaleY(candle.close));
    });
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();

    // Apply a gradient fill to the area chart
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, "rgba(0, 150, 255, 0.2)");
    gradient.addColorStop(1, "rgba(0, 150, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the line connecting close prices with modern styling
    ctx.beginPath();
    ctx.moveTo(candleSpacing / 2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0)
        ctx.lineTo(i * candleSpacing + candleSpacing / 2, scaleY(candle.close));
    });

    // Create a gradient for the line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, "rgba(0, 150, 255, 0.9)");
    lineGradient.addColorStop(1, "rgba(0, 200, 255, 0.9)");

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5; // Thicker line
    ctx.stroke();

    // Draw the candlesticks
    data.forEach((candle, i) => {
      const x = i * candleSpacing + candleSpacing / 2 - candleWidth / 2;
      const isUp = candle.close >= candle.open;
      const color = isUp ? "#00C896" : "#FF5064";
      const fillColor = isUp
        ? "rgba(0, 200, 150, 0.3)"
        : "rgba(255, 80, 100, 0.3)";

      // Draw the candle wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, scaleY(candle.high));
      ctx.lineTo(x + candleWidth / 2, scaleY(candle.low));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw the candle body
      const openY = scaleY(candle.open);
      const closeY = scaleY(candle.close);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      const bodyY = Math.min(openY, closeY);

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = color;
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
      ctx.strokeRect(x, bodyY, candleWidth, bodyHeight);

      // Highlight the hovered candle
      if (hoveredPoint && hoveredPoint.index === i) {
        ctx.fillStyle = isUp
          ? "rgba(0, 200, 150, 0.6)"
          : "rgba(255, 80, 100, 0.6)";
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
        ctx.strokeStyle = isUp ? "#00C896" : "#FF5064";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, bodyY, candleWidth, bodyHeight);
      }
    });

    // Draw price labels on the Y-axis
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (maxPrice - minPrice) * (i / 5);
      ctx.fillText(
        `${Math.round(price * 100)}%`,
        width - 15,
        scaleY(price) + 4
      );
    }

    // Draw time labels on the X-axis
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
      ctx.fillText(timeLabel, x, height - 15);
    }

    // If a point is hovered, draw a crosshair and tooltip
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

    // The chart height is the top 85% of the total canvas height
    const chartHeight = height * 0.85;

    // Calculate the simple moving average (SMA) over 10 periods
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

    // Determine min/max prices for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.15;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values to fit the chart area
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    // Define candle dimensions
    const candleSpacing = width / Math.max(1, data.length);

    // Draw the SMA line
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

    ctx.strokeStyle = "rgba(255, 180, 50, 0.8)"; // Orange color for SMA
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Add a label for the SMA line
    ctx.fillStyle = "rgba(255, 180, 50, 0.9)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("SMA (10)", 15, 25);
  };

  const drawCrosshair = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Draw the vertical line of the crosshair
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    // Draw the horizontal line of the crosshair
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash
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
    const tooltipWidth = 140;
    const tooltipHeight = 70;
    const padding = 10;

    // Position the tooltip to stay within the canvas bounds
    let tooltipX = point.x + 20;
    if (tooltipX + tooltipWidth > width) {
      tooltipX = point.x - tooltipWidth - 20;
    }

    let tooltipY = point.y - tooltipHeight / 2;
    if (tooltipY < 0) {
      tooltipY = 0;
    } else if (tooltipY + tooltipHeight > height) {
      tooltipY = height - tooltipHeight;
    }

    // Draw the tooltip background
    ctx.fillStyle = "rgba(10, 15, 20, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Format the time and price for display
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

    // Draw the text inside the tooltip
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Price:", tooltipX + padding, tooltipY + padding + 18);
    ctx.fillText("Time:", tooltipX + padding, tooltipY + padding + 42);

    ctx.fillStyle = "rgba(0, 200, 255, 1)";
    ctx.textAlign = "right";
    ctx.fillText(
      formattedPrice,
      tooltipX + tooltipWidth - padding,
      tooltipY + padding + 18
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(
      formattedTime,
      tooltipX + tooltipWidth - padding,
      tooltipY + padding + 42
    );
  };

  const drawCurrentPriceIndicator = (
    ctx: CanvasRenderingContext2D,
    price: number,
    width: number,
    height: number,
    data: ChartDataPoint[]
  ) => {
    // The chart height is the top 85% of the total canvas height
    const chartHeight = height * 0.85;

    // Determine min/max prices for scaling
    let minPrice = Math.min(...data.map((d) => d.low));
    let maxPrice = Math.max(...data.map((d) => d.high));
    const padding = (maxPrice - minPrice) * 0.15;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);

    // Scale Y values to fit the chart area
    const scaleY = (value: number) =>
      chartHeight -
      ((value - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

    const y = scaleY(price);

    // Draw a dashed line for the current price
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = "rgba(0, 180, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw a label with a background for the current price
    const labelText = `${(price * 100).toFixed(2)}%`;
    const labelWidth = ctx.measureText(labelText).width + 20;

    ctx.fillStyle = "rgba(0, 180, 255, 1)";
    ctx.beginPath();
    ctx.roundRect(width - labelWidth - 8, y - 12, labelWidth, 24, 6);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labelText, width - labelWidth / 2 - 8, y + 5);
  };



  return (
    <div 
      className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden relative"
      style={{ 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* Header Section */}
  


        {/* Price Info Section */}
        <div className="px-6 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-white drop-shadow-sm">
              {Math.round(currentPrice * 100)}%
            </span>
            <span
              className={`ml-3 flex items-center font-bold ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange >= 0 ? (
                <ArrowUp size={18} className="mr-1" />
              ) : (
                <ArrowDown size={18} className="mr-1" />
              )}
              {Math.abs(parseFloat(priceChange.toFixed(1)))}%
            </span>
            <span className="ml-4 text-slate-300 text-sm px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium">
              Odds: {calculateOdds(marketData)}
            </span>
          </div>

          {chartMetrics && (
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">High:</span>
                <span className="text-green-400">
                  {(chartMetrics.maxPrice * 100).toFixed(1)}%
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Low:</span>
                <span className="text-red-400">
                  {(chartMetrics.minPrice * 100).toFixed(1)}%
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Avg:</span>
                <span className="text-amber-400">
                  {(chartMetrics.avgPrice * 100).toFixed(1)}%
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Trading Activity Summary */}
        <div className="px-6 pt-3 pb-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
              <div className="text-slate-400 mb-1.5 font-medium">24h Trades</div>
              <div className="text-white font-bold text-lg drop-shadow-sm">
                {Math.floor(Math.random() * 1000) + 200}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
              <div className="text-slate-400 mb-1.5 font-medium">Daily Volume</div>
              <div className="text-white font-bold text-lg drop-shadow-sm">
                ${(Math.random() * 250000 + 50000).toFixed(0)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
              <div className="text-slate-400 mb-1.5 font-medium">Forecasters</div>
              <div className="text-white font-bold text-lg drop-shadow-sm">
                {Math.floor(Math.random() * 500) + 100}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[400px] relative px-4 pb-5 pt-3">
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          )}
          <canvas ref={canvasRef} className="w-full h-full cursor-crosshair rounded-lg" />

          {/* Chart Info Tooltip */}
          <div className="absolute top-4 right-4 group">
            <button className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-slate-400 hover:text-white transition-colors shadow-lg">
              <Info size={16} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-sm text-slate-300 z-20">
              <p className="mb-1.5 font-medium">
                This chart displays the price probability over time. Hover for more details.
              </p>
              <p className="text-amber-400 font-medium">The orange line indicates the 10-period moving average.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced glass effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </div>
  );
};

export default ChartCard;