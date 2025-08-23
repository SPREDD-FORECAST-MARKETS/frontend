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

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const preloadImages = (urls: string[]): void => {
  urls.forEach((url: string) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  });
};

const getCardsPerView = (): number => {
  if (typeof window === "undefined") return 4;
  const width: number = window.innerWidth;
  if (width < 640) return 1; // sm: 1 card
  if (width < 768) return 2; // md: 2 cards
  if (width < 1024) return 3; // lg: 3 cards
  return 4; // xl+: 4 cards
};

const isMarketClosed = (market: MostTradedMarket): boolean => {
  const expiryDate: string = market.expiry_date; // Adjust field name if different
  const currentDate: Date = new Date();
  return new Date(expiryDate).getTime() <= currentDate.getTime();
};

interface MarketDetails {
  totalVolume: number;
  probabilityA: number;
  probabilityB: number;
  bettorCount?: number;
}

interface MarketStatsProps {
  market: MostTradedMarket;
}

const MarketStats: React.FC<MarketStatsProps> = ({
  market,
}) => (
  <>
    {/* Mobile: Simple inline display */}
    <div className="sm:hidden text-orange-400 text-sm font-medium mb-3">
      <span>{market.tradeCount} Trades</span>
      {market.totalVolume && Number(market.totalVolume) > 0 && (
        <span> • ${Number(market.totalVolume).toFixed(0)}</span>
      )}
    </div>

    {/* Desktop: Original badge design */}
    <div className="hidden sm:flex justify-between mb-2">
      {/* Trade Count Badge */}
      <div className="inline-flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-md border border-orange-500/40 rounded-full px-2 sm:px-4 py-1 sm:py-2 self-start shadow-lg">
        <img src="usdc.svg" className="w-3 sm:w-4 h-3 sm:h-4" alt="USDC" />
        <span className="text-orange-400 text-xs sm:text-sm font-semibold">
          {market.tradeCount} Trades
        </span>
      </div>

      {/* Volume Display */}
      {market.totalVolume && Number(market.totalVolume) > 0 && (
        <div className="inline-flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-md border border-green-500/40 rounded-full px-2 sm:px-4 py-1 sm:py-2 self-start shadow-lg">
          <span className="text-green-400 text-xs sm:text-sm font-semibold">
            ${Number(market.totalVolume).toFixed(2)} Volume
          </span>
        </div>
      )}
    </div>
  </>
);

interface ActionButtonsProps {
  market: MostTradedMarket;
  marketDetails: MarketDetails | null;
  onBuyClick: (e: React.MouseEvent, outcome: "yes" | "no") => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  marketDetails,
  onBuyClick
}) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={(e: React.MouseEvent) => onBuyClick(e, "yes")}
      className="
        bg-orange-500 hover:bg-orange-400 
        text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 
        hover:scale-[1.02] shadow-lg text-base
        focus:outline-none focus:ring-2 focus:ring-orange-400
        flex flex-col items-center justify-center
      "
    >
      <span className="text-lg">Yes</span>
      {marketDetails?.probabilityA && (
        <span className="text-base font-bold">{marketDetails.probabilityA.toFixed(1)}%</span>
      )}
    </button>

    <button
      onClick={(e: React.MouseEvent) => onBuyClick(e, "no")}
      className="
        bg-slate-600 hover:bg-slate-500 
        text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 
        hover:scale-[1.02] shadow-lg text-base
        focus:outline-none focus:ring-2 focus:ring-slate-400
        flex flex-col items-center justify-center
      "
    >
      <span className="text-lg">No</span>
      {marketDetails?.probabilityB && (
        <span className="text-base font-bold">{marketDetails.probabilityB.toFixed(1)}%</span>
      )}
    </button>
  </div>
);

interface LoadingSkeletonProps {
  count: number;
}

// Loading Skeleton Component
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, i: number) => (
      <div
        key={`skeleton-${i}`}
        className="
          aspect-square bg-slate-800 rounded-3xl animate-pulse 
          min-h-[200px] sm:min-h-[240px] lg:min-h-[270px]
          bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800
        "
      />
    ))}
  </>
);

interface MarketCardProps {
  market: MostTradedMarket;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { data: marketDetails } = useMarketDetails(market.marketId);

  const handleBuyClick = useCallback((e: React.MouseEvent, outcome: "yes" | "no"): void => {
    e.preventDefault();
    e.stopPropagation();

    try {
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
    } catch (error) {
      setHasError(true);
    }
  }, [market, navigate]);

  // Handle image load errors
  const handleImageError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <Link
      to={`/trade/${market.id}`}
      className="
        relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl 
        group bg-[#131314f2]
        backdrop-blur-xl border border-slate-600/60
        sm:hover:scale-[1.02] transition-all duration-300 
        min-h-[200px] sm:min-h-[180px] lg:min-h-[220px] block 
        shadow-lg shadow-black/20
        sm:hover:border-slate-500/80 sm:hover:-translate-y-1 sm:hover:shadow-3xl sm:hover:shadow-black/30
        w-full max-w-full
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 opacity-20"
        style={{
          backgroundImage: market.image && !hasError ? `url(${market.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Hidden image for error handling */}
      {market.image && (
        <img
          src={market.image}
          alt=""
          className="hidden"
          onError={handleImageError}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 md:p-5">
        {/* Top Section: Statistics */}
        <MarketStats market={market} />

        {/* Middle Section: Question */}
        <div className="flex-1 flex items-center min-h-0 my-2 sm:my-4">
          <h3 className="text-white font-extrabold text-xl sm:font-bold sm:text-lg lg:text-xl leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-3 drop-shadow-lg break-words">
            {market.question}
          </h3>
        </div>

        {/* Creator Info - Mobile: Always show, Desktop: Hide on hover */}
        <div
          className={`
            transition-all duration-300
            ${isHovered ? "sm:opacity-0 sm:translate-y-2" : "sm:opacity-100 sm:translate-y-0"}
          `}
        >
          <span className="text-white/70 text-xs sm:text-white/80 sm:text-sm sm:font-medium">
            by <span className="text-orange-400 font-semibold">{market.creator.username}</span>
          </span>
        </div>

        {/* Action Buttons - Desktop only on hover, Hidden on mobile */}
        <div
          className={`
            hidden sm:block absolute bottom-4 left-4 right-4 transition-all duration-300
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

interface UseSlideNavigationReturn {
  slideIndex: number;
  goToSlide: (i: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
}

const useSlideNavigation = (totalSlides: number, cardsPerView: number): UseSlideNavigationReturn => {
  const [slideIndex, setSlideIndex] = useState<number>(0);

  const goToSlide = useCallback(
    (i: number): void => setSlideIndex(() => ((i % totalSlides) + totalSlides) % totalSlides),
    [totalSlides]
  );

  const nextSlide = useCallback((): void => {
    if (totalSlides > 0) goToSlide(slideIndex + 1);
  }, [goToSlide, slideIndex, totalSlides]);

  const prevSlide = useCallback((): void => {
    if (totalSlides > 0) goToSlide(slideIndex - 1);
  }, [goToSlide, slideIndex, totalSlides]);

  // Reset slide index when cards per view changes
  useEffect(() => {
    setSlideIndex(0);
  }, [cardsPerView]);

  return { slideIndex, goToSlide, nextSlide, prevSlide };
};

interface UseMarketDataReturn {
  trendingMarkets: MostTradedMarket[];
  loading: boolean;
  error: string | null;
}

const useMarketData = (maxSlides: number): UseMarketDataReturn => {
  const [trendingMarkets, setTrendingMarkets] = useState<MostTradedMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async (isRefresh: boolean = false): Promise<void> => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [data, status] = await fetchMostTradedMarkets(maxSlides);

      if (status === 200 && data && Array.isArray(data)) {
        setTrendingMarkets(data);
        preloadImages(data.slice(0, maxSlides).map((m: MostTradedMarket) => m.image));
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
    const refreshInterval: NodeJS.Timeout = setInterval(() => fetchMarkets(true), 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchMarkets]);

  return { trendingMarkets, loading, error };
};

const useResponsiveView = (): number => {
  const [cardsPerView, setCardsPerView] = useState<number>(getCardsPerView());

  useEffect(() => {
    const handleResize = (): void => {
      setCardsPerView(getCardsPerView());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardsPerView;
};

const useAutoSlide = (nextSlide: () => void, totalSlides: number, hovered: boolean): void => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hovered || totalSlides <= 1 || prefersReducedMotion()) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTimer = (): void => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(nextSlide, SLIDE_DURATION_MS);
    };

    const handleVisibilityChange = (): void => {
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

const useWheelNavigation = (
  nextSlide: () => void, 
  prevSlide: () => void, 
  totalSlides: number,
  containerRef: React.RefObject<HTMLDivElement>
): void => {
  const lastWheelTime = useRef<number>(0);
  const wheelThreshold = 100; // Minimum delta for wheel event
  const wheelCooldown = 500; // Cooldown between wheel navigation (ms)

  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalSlides <= 1) return;

    const handleWheel = (e: WheelEvent): void => {
      const now = Date.now();
      
      // Check if enough time has passed since last wheel navigation
      if (now - lastWheelTime.current < wheelCooldown) return;
      
      // Check if scroll is significant enough (filter out small trackpad movements)
      const deltaY = Math.abs(e.deltaY);
      const deltaX = Math.abs(e.deltaX);
      
      if (deltaY < wheelThreshold && deltaX < wheelThreshold) return;

      // Prevent default scrolling
      e.preventDefault();
      
      // Determine scroll direction (prioritize horizontal scroll for trackpad)
      const isScrollingRight = deltaX > deltaY ? e.deltaX > 0 : e.deltaY > 0;
      
      if (isScrollingRight) {
        nextSlide();
      } else {
        prevSlide();
      }
      
      lastWheelTime.current = now;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [nextSlide, prevSlide, totalSlides, containerRef]);
};

const TrendingMarketBanner: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null!);

  // Add style for hiding scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Custom hooks for better organization
  const cardsPerView: number = useResponsiveView();
  const { trendingMarkets, loading, error }: UseMarketDataReturn = useMarketData(MAX_SLIDES);

  // Memoized calculations
  const displayMarkets: MostTradedMarket[] = useMemo(
    () => trendingMarkets.slice(0, Math.min(trendingMarkets.length, MAX_SLIDES)),
    [trendingMarkets]
  );

  // Filter out closed markets first
  const openMarkets: MostTradedMarket[] = useMemo(
    () => displayMarkets.filter(market => !isMarketClosed(market)),
    [displayMarkets]
  );

  const totalSlides: number = Math.ceil(openMarkets.length / cardsPerView);

  const { slideIndex, goToSlide, nextSlide, prevSlide }: UseSlideNavigationReturn = useSlideNavigation(totalSlides, cardsPerView);

  const currentSlideMarkets: MostTradedMarket[] = useMemo(() => {
    const startIdx: number = slideIndex * cardsPerView;
    return openMarkets.slice(startIdx, startIdx + cardsPerView);
  }, [openMarkets, slideIndex, cardsPerView]);

  // Auto-slide functionality
  useAutoSlide(nextSlide, totalSlides, hovered);
  
  // Wheel navigation functionality
  useWheelNavigation(nextSlide, prevSlide, totalSlides, containerRef);

  // Early returns for edge cases
  if (loading) {
    return (
      <section className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-orange-400 mb-6">
          HOT MARKETS
        </h2>
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <LoadingSkeleton count={cardsPerView} />
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-orange-400 mb-6">
          HOT MARKETS
        </h2>
        <div className="bg-slate-800/50 border border-slate-600/60 rounded-3xl p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-slate-300">Unable to load trending markets</p>
            <p className="text-sm text-slate-500 mt-2">Please check your connection and try again</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (trendingMarkets.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="Trending Markets"
      className="mb-6 animate-fade-in"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold text-orange-400 mb-6">
        HOT MARKETS
      </h2>

      <div
        ref={containerRef}
        className="relative w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="region"
        aria-label="Trending markets banner"
        style={{
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        {/* Main Content - Horizontal Scroll Container */}
        <div className="w-full">
          {/* Mobile: Horizontal scroll */}
          <div 
            className="sm:hidden overflow-x-auto scrollbar-hide -mx-6" 
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="flex px-6 pb-2" style={{
              scrollSnapType: 'x mandatory'
            }}>
              {loading ? (
                <LoadingSkeleton count={cardsPerView} />
              ) : (
                openMarkets.map((market: MostTradedMarket) => (
                  <div key={market.id} className="flex-none w-[calc(100vw-3rem)] pr-4" style={{
                    scrollSnapAlign: 'start'
                  }}>
                    <MarketCard market={market} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop: Grid with slides */}
          <div className="hidden sm:block">
            <div
              className={`
              grid gap-4 lg:gap-5
              grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              w-full max-w-full
              transition-all duration-500 ease-in-out
            `}
            >
              {loading ? (
                <LoadingSkeleton count={cardsPerView} />
              ) : (
                currentSlideMarkets.map((market: MostTradedMarket) => (
                  <MarketCard key={market.id} market={market} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Navigation Dots - Desktop only */}
        {totalSlides > 1 && (
          <div 
            className="hidden sm:flex items-center justify-center gap-1.5 mt-4"
            role="tablist"
            aria-label="Market slides navigation"
          >
            {Array.from({ length: totalSlides }).map((_, i: number) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`
                  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black
                  ${i === slideIndex 
                    ? "w-8 h-2 bg-orange-500 rounded-full" 
                    : "w-2 h-2 bg-slate-600 hover:bg-slate-500 rounded-full"
                  }
                `}
                role="tab"
                aria-selected={i === slideIndex}
                aria-controls={`slide-${i}`}
                aria-label={`Go to slide ${i + 1} of ${totalSlides}`}
                tabIndex={i === slideIndex ? 0 : -1}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/create-prediction"
        className="block sm:hidden mt-6 w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] active:from-[#ff8c42] active:to-[#ff6b35] text-white font-semibold px-6 py-4 rounded-2xl transition-all duration-300 transform active:scale-[0.98] text-center flex items-center justify-center gap-2.5 border border-orange-500/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
        <span className="text-base tracking-wide">Create Prediction</span>
      </Link>
    </section>
  );
};

export default TrendingMarketBanner;