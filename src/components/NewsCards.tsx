import  { useState, useEffect } from 'react';
import {  ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const NewsCards = () => {
  const [isVisible, ] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    {
      id: 1,
      category: "Crypto",
      title: "STRK Token Price",
      subtitle: "Will STRK reach $5 by December 2024?",
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop&crop=center",
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      link: "/markets/strk-token",
      bgColor: "bg-gradient-to-r from-orange-600 to-amber-600"
    },
    {
      id: 2,
      category: "Politics",
      title: "US Elections 2024",
      subtitle: "Who will win the presidential race?",
      image: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=400&h=200&fit=crop&crop=center",
      gradient: "from-red-500 via-rose-500 to-pink-500",
      link: "/markets/us-elections",
      bgColor: "bg-gradient-to-r from-red-600 to-rose-600"
    },
    {
      id: 3,
      category: "Tech",
      title: "Apple iPhone 16",
      subtitle: "Will Apple release iPhone 16 in September?",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=200&fit=crop&crop=center",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      link: "/markets/iphone-16",
      bgColor: "bg-gradient-to-r from-blue-600 to-indigo-600"
    },
    {
      id: 4,
      category: "Sports",
      title: "FIFA World Cup 2026",
      subtitle: "Which country will host the opening match?",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop&crop=center",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      link: "/markets/fifa-2026",
      bgColor: "bg-gradient-to-r from-green-600 to-emerald-600"
    },
    {
      id: 5,
      category: "Entertainment",
      title: "Marvel Phase 5",
      subtitle: "Will Deadpool 3 break box office records?",
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=200&fit=crop&crop=center",
      gradient: "from-purple-500 via-violet-500 to-fuchsia-500",
      link: "/markets/deadpool-3",
      bgColor: "bg-gradient-to-r from-purple-600 to-violet-600"
    }
  ];

  // Auto-scroll banners
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible, banners.length]);

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="backdrop-blur-xl shadow-lg overflow-hidden"
      style={{ 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 px-4 py-2">
        <div className=" mx-auto flex items-center justify-between">
          {/* Navigation Arrow Left */}
          <button
            onClick={prevBanner}
            className="hidden md:flex p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          {/* Banner Container */}
          <div className="flex-1 mx-2 md:mx-4 overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {banners.map((banner, index) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  {/* Desktop: Show two banners side by side */}
                  <div className="hidden md:flex gap-4">
                    {/* Current Banner */}
                    <div className="flex-1">
                      <a
                        href={banner.link}
                        className="group relative block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        {/* Banner Background */}
                        <div className={`${banner.bgColor} p-4 sm:p-6 relative overflow-hidden min-h-[80px] sm:min-h-[100px]`}>
                          {/* Animated background pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                          </div>

                          {/* Content */}
                          <div className="relative z-10 flex items-center justify-between">
                            {/* Left Content */}
                            <div className="flex-1 pr-4">
                              {/* Category Badge */}
                              <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-2">
                                <span className="text-white text-xs font-semibold uppercase tracking-wide">
                                  {banner.category}
                                </span>
                              </div>

                              {/* Title */}
                              <h2 className="text-white font-bold text-lg lg:text-xl mb-1 drop-shadow-sm">
                                {banner.title}
                              </h2>

                              {/* Subtitle */}
                              <p className="text-white/90 text-sm font-medium drop-shadow-sm line-clamp-2">
                                {banner.subtitle}
                              </p>
                            </div>

                            {/* Right Content - Image/Icon */}
                            <div className="flex items-center space-x-3">
                              {/* Action Button */}
                              <div className="group/btn relative overflow-hidden">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                  {/* Shimmer effect */}
                                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-lg">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                                  </div>
                                  
                                  <span className="relative z-10 text-sm">Trade</span>
                                  <ExternalLink className="w-3 h-3 relative z-10" />
                                </div>
                              </div>

                              {/* Visual Element */}
                              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex-shrink-0">
                                <img
                                  src={banner.image}
                                  alt={banner.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
                        </div>
                      </a>
                    </div>

                    {/* Next Banner */}
                    <div className="flex-1">
                      {(() => {
                        const nextBanner = banners[(index + 1) % banners.length];
                        return (
                          <a
                            href={nextBanner.link}
                            className="group relative block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                          >
                            {/* Banner Background */}
                            <div className={`${nextBanner.bgColor} p-4 sm:p-6 relative overflow-hidden min-h-[80px] sm:min-h-[100px]`}>
                              {/* Animated background pattern */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              </div>

                              {/* Content */}
                              <div className="relative z-10 flex items-center justify-between">
                                {/* Left Content */}
                                <div className="flex-1 pr-4">
                                  {/* Category Badge */}
                                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-2">
                                    <span className="text-white text-xs font-semibold uppercase tracking-wide">
                                      {nextBanner.category}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h2 className="text-white font-bold text-lg lg:text-xl mb-1 drop-shadow-sm">
                                    {nextBanner.title}
                                  </h2>

                                  {/* Subtitle */}
                                  <p className="text-white/90 text-sm font-medium drop-shadow-sm line-clamp-2">
                                    {nextBanner.subtitle}
                                  </p>
                                </div>

                                {/* Right Content - Image/Icon */}
                                <div className="flex items-center space-x-3">
                                  {/* Action Button */}
                                  <div className="group/btn relative overflow-hidden">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                      {/* Shimmer effect */}
                                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-lg">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                                      </div>
                                      
                                      <span className="relative z-10 text-sm">Trade</span>
                                      <ExternalLink className="w-3 h-3 relative z-10" />
                                    </div>
                                  </div>

                                  {/* Visual Element */}
                                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex-shrink-0">
                                    <img
                                      src={nextBanner.image}
                                      alt={nextBanner.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Decorative Elements */}
                              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
                            </div>
                          </a>
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      {(() => {
                        const nextBanner = banners[(index + 1) % banners.length];
                        return (
                          <a
                            href={nextBanner.link}
                            className="group relative block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                          >
                            {/* Banner Background */}
                            <div className={`${nextBanner.bgColor} p-4 sm:p-6 relative overflow-hidden min-h-[80px] sm:min-h-[100px]`}>
                              {/* Animated background pattern */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              </div>

                              {/* Content */}
                              <div className="relative z-10 flex items-center justify-between">
                                {/* Left Content */}
                                <div className="flex-1 pr-4">
                                  {/* Category Badge */}
                                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-2">
                                    <span className="text-white text-xs font-semibold uppercase tracking-wide">
                                      {nextBanner.category}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h2 className="text-white font-bold text-lg lg:text-xl mb-1 drop-shadow-sm">
                                    {nextBanner.title}
                                  </h2>

                                  {/* Subtitle */}
                                  <p className="text-white/90 text-sm font-medium drop-shadow-sm line-clamp-2">
                                    {nextBanner.subtitle}
                                  </p>
                                </div>

                                {/* Right Content - Image/Icon */}
                                <div className="flex items-center space-x-3">
                                  {/* Action Button */}
                                  <div className="group/btn relative overflow-hidden">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                      {/* Shimmer effect */}
                                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-lg">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                                      </div>
                                      
                                      <span className="relative z-10 text-sm">Trade</span>
                                      <ExternalLink className="w-3 h-3 relative z-10" />
                                    </div>
                                  </div>

                                  {/* Visual Element */}
                                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex-shrink-0">
                                    <img
                                      src={nextBanner.image}
                                      alt={nextBanner.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Decorative Elements */}
                              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
                            </div>
                          </a>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Mobile: Show single banner */}
                  <div className="block md:hidden">
                    <a
                      href={banner.link}
                      className="group relative block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Banner Background */}
                      <div className={`${banner.bgColor} p-4 relative overflow-hidden min-h-[80px]`}>
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                          {/* Category Badge */}
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-2">
                            <span className="text-white text-xs font-semibold uppercase tracking-wide">
                              {banner.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-white font-bold text-lg mb-1 drop-shadow-sm">
                            {banner.title}
                          </h2>

                          {/* Subtitle */}
                          <p className="text-white/90 text-sm font-medium drop-shadow-sm line-clamp-2 mb-3">
                            {banner.subtitle}
                          </p>

                          {/* Action Button - Mobile */}
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 text-sm">
                            <span>Trade Now</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrow Right */}
          <button
            onClick={nextBanner}
            className="hidden md:flex p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

        </div>

        {/* Progress indicators */}
        <div className="flex justify-center mt-2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white shadow-lg scale-125'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced glass effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default NewsCards;