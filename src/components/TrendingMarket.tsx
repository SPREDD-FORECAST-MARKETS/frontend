import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchMostTradedMarkets,
  handleDashboardError,
  type MostTradedMarket,
} from "../apis/leaderboard";
import { useMarketDetails } from "../hooks/useMarketDetails";

const SLIDE_DURATION_MS = 4000;
const MAX_SLIDES = 12;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  });
};

const getCardsPerView = () => {
  if (typeof window === "undefined") return 4;
  const width = window.innerWidth;
  if (width < 640) return 1; // sm: 1 card
  if (width < 768) return 2; // md: 2 cards
  if (width < 1024) return 3; // lg: 3 cards
  return 4; // xl+: 4 cards
};

const isMarketClosed = (market: MostTradedMarket) => {
  const expiryDate = market.expiry_date; // Adjust field name if different
  const currentDate = new Date();
  return new Date(expiryDate).getTime() <= currentDate.getTime();
};


const NavigationDot = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    aria-label={label}
    onClick={onClick}
    className={`
      w-2.5 h-2.5 rounded-full transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-orange-500
      ${active ? "bg-orange-500 scale-125 shadow-md" : "bg-white/30 hover:bg-white/50"}
    `}
  />
);

const MarketStats = ({ 
  market, 
  marketDetails 
}: { 
  market: MostTradedMarket; 
  marketDetails: any; 
}) => (
  <div className="flex justify-between">
    {/* Trade Count Badge */}
    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-orange-500/40 rounded-full px-3 py-1 self-start">
      <img src="usdc.svg" className="w-4 h-4" alt="USDC" />
      <span className="text-orange-400 text-xs font-medium">
        {market.tradeCount} Trades
      </span>
    </div>

    {/* Volume Display */}
    {marketDetails?.totalVolume && (
      <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-green-500/40 rounded-full px-3 py-1 self-start">
        <span className="text-green-400 text-xs font-medium">
          ${(marketDetails.totalVolume / 1e6).toFixed(2)} Volume
        </span>
      </div>
    )}
  </div>
);

const ActionButtons = ({ 
  marketDetails, 
  onBuyClick 
}: { 
  market: MostTradedMarket; 
  marketDetails: any; 
  onBuyClick: (e: React.MouseEvent, outcome: "yes" | "no") => void; 
}) => (
  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={(e) => onBuyClick(e, "yes")}
      className="
        bg-orange-500 hover:bg-orange-600 backdrop-blur-sm border border-orange-400/50 
        text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 
        hover:scale-105 shadow-sm hover:shadow-orange-500/20 text-xs sm:text-sm
        focus:outline-none focus:ring-2 focus:ring-orange-500
        flex flex-col items-center
      "
    >
      <span>Yes</span>
      {marketDetails?.probabilityA && (
        <span className="text-xs opacity-90">{marketDetails.probabilityA.toFixed(1)}%</span>
      )}
    </button>
    
    <button
      onClick={(e) => onBuyClick(e, "no")}
      className="
        bg-slate-700 hover:bg-slate-600 backdrop-blur-sm border border-slate-600/50 
        text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 
        hover:scale-105 shadow-sm hover:shadow-slate-500/20 text-xs sm:text-sm
        focus:outline-none focus:ring-2 focus:ring-orange-500
        flex flex-col items-center
      "
    >
      <span>No</span>
      {marketDetails?.probabilityB && (
        <span className="text-xs opacity-90">{marketDetails.probabilityB.toFixed(1)}%</span>
      )}
    </button>
  </div>
);

// Loading Skeleton Component
const LoadingSkeleton = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={`skeleton-${i}`}
        className="
          aspect-square bg-slate-800 rounded-xl animate-pulse 
          min-h-[200px] sm:min-h-[240px] lg:min-h-[270px]
          bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800
        "
      />
    ))}
  </>
);

const MarketCard = ({ market }: { market: MostTradedMarket }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { data: marketDetails } = useMarketDetails(market.marketId);

  const handleBuyClick = useCallback((e: React.MouseEvent, outcome: "yes" | "no") => {
    e.preventDefault();
    e.stopPropagation();

    const marketData = {
      id: market.id,
      name: market.question,
      outcomes: { yes: "Yes", no: "No" },
      creator: market.creator.username,
      iconUrl: market.image,
    };

    navigate(`/trade/${market.id}`, {
      state: {
        marketData,
        initialBuy: outcome === "yes",
      },
    });
  }, [market, navigate]);

  return (
    <Link
      to={`/trade/${market.id}`}
      className="
        relative aspect-square overflow-hidden rounded-xl border border-slate-700/50 
        group hover:scale-[1.03] transition-all duration-300 
        min-h-[200px] sm:min-h-[240px] lg:min-h-[270px] block shadow-md hover:shadow-orange-500/10
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 bg-slate-900/80 "
        style={{
          backgroundImage: market.image ? `url(${market.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity:0.5
        }}
      >
        <div
          className={`
            absolute inset-0 bg-gradient-to-t transition-opacity duration-300
            ${isHovered ? "from-black/90 via-black/60 to-black/30"  : "from-black/85 via-black/50 to-black/20"}
          `}
        />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full p-4 sm:p-5 lg:p-6">
        {/* Top Section: Statistics */}
        <MarketStats market={market} marketDetails={marketDetails} />

        {/* Middle Section: Question */}
        <div className="flex-1 flex items-center min-h-0 my-4">
          <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-3 drop-shadow-sm">
            {market.question}
          </h3>
        </div>

        {/* Bottom Section: Creator Info (Default View) */}
        <div
          className={`
            transition-all duration-300
            ${isHovered ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
          `}
        >
          <span className="text-white/60 text-xs sm:text-sm">
            by <span className="text-orange-400 font-medium">{market.creator.username}</span>
          </span>
        </div>

        {/* Bottom Section: Action Buttons (Hover View) */}
        <div
          className={`
            absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 
            right-4 sm:right-5 lg:right-6 transition-all duration-300
            ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          `}
        >
          <ActionButtons 
            market={market} 
            marketDetails={marketDetails} 
            onBuyClick={handleBuyClick} 
          />
        </div>
      </div>
    </Link>
  );
};

const useSlideNavigation = (totalSlides: number, cardsPerView: number) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const goToSlide = useCallback(
    (i: number) => setSlideIndex(() => ((i % totalSlides) + totalSlides) % totalSlides),
    [totalSlides]
  );

  const nextSlide = useCallback(() => {
    if (totalSlides > 0) goToSlide(slideIndex + 1);
  }, [goToSlide, slideIndex, totalSlides]);

  // Reset slide index when cards per view changes
  useEffect(() => {
    setSlideIndex(0);
  }, [cardsPerView]);

  return { slideIndex, goToSlide, nextSlide };
};

const useMarketData = (maxSlides: number) => {
  const [trendingMarkets, setTrendingMarkets] = useState<MostTradedMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      
      const [data, status] = await fetchMostTradedMarkets(maxSlides);
      
      if (status === 200 && data) {
        setTrendingMarkets(data);
        preloadImages(data.slice(0, maxSlides).map((m) => m.image));
      } else {
        throw new Error("Failed to fetch trending markets");
      }
    } catch (e: any) {
      if (!isRefresh) {
        setError(handleDashboardError(e, "fetchMostTradedMarkets"));
      }
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [maxSlides]);

  useEffect(() => {
    fetchMarkets();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => fetchMarkets(true), 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchMarkets]);

  return { trendingMarkets, loading, error };
};

const useResponsiveView = () => {
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardsPerView;
};

const useAutoSlide = (nextSlide: () => void, totalSlides: number, hovered: boolean) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hovered || totalSlides <= 1 || prefersReducedMotion()) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(nextSlide, SLIDE_DURATION_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [nextSlide, totalSlides, hovered]);
};

const TrendingMarketBanner: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  
  // Custom hooks for better organization
  const cardsPerView = useResponsiveView();
  const { trendingMarkets, loading, error } = useMarketData(MAX_SLIDES);
  
  // Memoized calculations
  const displayMarkets = useMemo(
    () => trendingMarkets.slice(0, Math.min(trendingMarkets.length, MAX_SLIDES)),
    [trendingMarkets]
  );

  const totalSlides = Math.ceil(displayMarkets.length / cardsPerView);
  
  const { slideIndex, goToSlide, nextSlide } = useSlideNavigation(totalSlides, cardsPerView);
  
  const currentSlideMarkets = useMemo(() => {
    const startIdx = slideIndex * cardsPerView;
    return displayMarkets.slice(startIdx, startIdx + cardsPerView);
  }, [displayMarkets, slideIndex, cardsPerView]);

  // Auto-slide functionality
  useAutoSlide(nextSlide, totalSlides, hovered);

  // Early returns for edge cases
  if (error || displayMarkets.length === 0) return null;

  return (
    <div
      className="relative w-full py-6 sm:py-8 lg:py-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="region"
      aria-label="Trending markets banner"
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 md:px-8 mx-auto">
        <div
          className={`
            grid gap-4 sm:gap-5 lg:gap-6
            grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            ${cardsPerView === 1 ? "max-w-md mx-auto" : ""}
          `}
        >
          {loading ? (
            <LoadingSkeleton count={cardsPerView} />
          ) : (
            <>
              {currentSlideMarkets.map((market) =>
                // Skip rendering MarketCard for closed markets
                !isMarketClosed(market) ? (
                  <MarketCard key={market.id} market={market} />
                ) : (
                  <div
                    key={`empty-closed-${market.id}`}
                    className="aspect-square opacity-0 hidden sm:block"
                  />
                )
              )}
              
              {/* Fill empty grid spots for consistent layout */}
              {cardsPerView > 1 &&
                Array.from({
                  length: Math.max(0, cardsPerView - currentSlideMarkets.length),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square opacity-0 hidden sm:block" />
                ))}
            </>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 px-4">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <NavigationDot
              key={i}
              active={i === slideIndex}
              onClick={() => goToSlide(i)}
              label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile Touch Instructions */}
      {totalSlides > 1 && (
        <div className="sm:hidden text-center mt-4 px-4">
          <p className="text-white/60 text-xs">Swipe or wait for auto-advance</p>
        </div>
      )}
    </div>
  );
};

export default TrendingMarketBanner;