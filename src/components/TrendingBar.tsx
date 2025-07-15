import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import type { TrendingTagsData } from '../lib/interface';

interface TrendingTagsProps {
  data: TrendingTagsData[];
  onChangeTag: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const TrendingTags = ({ data, onChangeTag }: TrendingTagsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedTag, setSelectedTag] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if scrolling is possible
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [data]);

  // Update scroll position for animation effects
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setScrollPosition(scrollContainerRef.current.scrollLeft);
      }
    };

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll right handler
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft > maxScroll - 250) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 250, behavior: 'smooth' });
      }
    }
  };

  // Scroll left handler
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (container.scrollLeft < 250) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -250, behavior: 'smooth' });
      }
    }
  };

  // Handle tag selection
  const handleTagSelect = (index: number, tag: string) => {
    setSelectedTag(index);
    onChangeTag(tag);
    const tagElements = scrollContainerRef.current?.children;
    if (tagElements && tagElements[index]) {
      const tagElement = tagElements[index] as HTMLElement;
      const container = scrollContainerRef.current;
      if (container) {
        const tagLeft = tagElement.offsetLeft;
        const tagRight = tagElement.offsetLeft + tagElement.offsetWidth;
        const containerLeft = container.scrollLeft;
        const containerRight = container.scrollLeft + container.clientWidth;
        if (tagLeft < containerLeft || tagRight > containerRight) {
          const scrollTo = tagLeft - 40;
          container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div
      className="relative flex justify-center bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-xl p-4 sm:p-6"
      ref={containerRef}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-transparent rounded-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between w-full relative">
        <div className="flex items-center flex-grow overflow-hidden relative">
          {scrollPosition > 10 && (
            <button
              className="flex-shrink-0 mr-2 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 backdrop-blur-sm z-10"
              onClick={scrollLeft}
            >
              <ChevronRight
                size={18}
                className="rotate-180 transform transition-transform hover:-translate-x-0.5 duration-300 text-orange-400"
              />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-3 overflow-x-auto scrollbar-hide py-2 px-4"
          >
            {data.map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(index, tag.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm sm:text-base transition-all duration-300 whitespace-nowrap transform hover:scale-105 hover:shadow-md hover:shadow-orange-500/20 ${index === selectedTag
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium shadow-md shadow-orange-500/30'
                    : 'bg-[#1a1a1a] text-white hover:bg-zinc-700/80'
                  }`}
              >
                {tag.icon && (
                  <span
                    className={`${index === selectedTag ? 'text-white' : 'text-orange-500'
                      } transition-all duration-300 transform hover:scale-110`}
                  >
                    {typeof tag.icon === 'string' ? (
                      tag.icon
                    ) : (
                      tag.icon.component && (
                        <tag.icon.component
                          size={
                            tag.icon.size
                              ? window.innerWidth < 640
                                ? tag.icon.size - 2
                                : tag.icon.size
                              : 18
                          }
                        />
                      )
                    )}
                  </span>
                )}
                <span className="font-medium">{tag.name}</span>
              </button>
            ))}
          </div>

          {showScrollIndicator &&
            scrollContainerRef.current &&
            scrollPosition <
            scrollContainerRef.current.scrollWidth -
            scrollContainerRef.current.clientWidth -
            10 && (
              <button
                className="flex-shrink-0 ml-2 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 backdrop-blur-sm z-10"
                onClick={scrollRight}
              >
                <ChevronRight
                  size={18}
                  className="transform transition-transform hover:translate-x-0.5 duration-300 text-orange-400"
                />
              </button>
            )}

          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#111] to-transparent pointer-events-none z-[5]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-[5]"></div>
        </div>

        <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-zinc-800/40 relative z-10">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-white font-serif text-base group transition-all duration-300 px-3 py-2 rounded-lg hover:bg-zinc-800/50 hover:shadow-md hover:shadow-orange-500/20"
          >
            <span className="font-semibold text-orange-400 group-hover:text-orange-300">
              Trending
            </span>
            <ChevronDown
              size={18}
              className={`text-orange-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="hidden sm:block absolute right-4 mt-3 p-4 bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-2xl z-50 w-[400px] animate-fadeIn"
          style={{ top: '100%' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800/50">
            <h3 className="text-white text-base font-serif font-medium">
              All Categories
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-orange-400 p-1.5 rounded-full hover:bg-zinc-800/50 transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data.map((tag, index) => (
              <button
                key={`dropdown-${index}`}
                onClick={() => {
                  handleTagSelect(index, tag.name);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:shadow-orange-500/20 ${selectedTag === index
                    ? 'bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400 border border-orange-700/40'
                    : 'bg-[#1a1a1a] text-white hover:bg-zinc-700/80'
                  }`}
              >
                {tag.icon && (
                  <span
                    className={`${selectedTag === index ? 'text-orange-400' : 'text-orange-500'
                      } transition-all duration-300 transform hover:scale-110`}
                  >
                    {typeof tag.icon === 'string' ? (
                      tag.icon
                    ) : (
                      tag.icon.component && (
                        <tag.icon.component
                          size={
                            tag.icon.size
                              ? window.innerWidth < 640
                                ? tag.icon.size - 2
                                : tag.icon.size
                              : 18
                          }
                        />
                      )
                    )}
                  </span>
                )}
                <span className="truncate font-medium">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TrendingTags;