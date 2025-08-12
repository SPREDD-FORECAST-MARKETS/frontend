import { useState, useRef, useEffect } from 'react';
import type { TrendingTagsData } from '../lib/interface';
import { Link } from 'react-router-dom';

interface TrendingTagsProps {
  data: TrendingTagsData[];
  onChangeTag: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const TrendingTags = ({ data, onChangeTag }: TrendingTagsProps) => {
  const [, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const tagWidth = tagElement.offsetWidth;
        const containerLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        if (tagLeft < containerLeft || tagLeft + tagWidth > containerLeft + containerWidth) {
          const scrollTo = tagLeft - containerWidth / 2 + tagWidth / 2;
          container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div
      className="relative w-full px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6"
      ref={dropdownRef}
      style={{ fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between w-full gap-6 lg:pl-[55px]">
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-4 overflow-x-auto scrollbar-hide py-2"
          >
            {Array.isArray(data) ? data.slice(0, 10).map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(index, tag.name)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm md:text-base 
                  transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg 
                  relative overflow-hidden group
                  ${
                    index === selectedTag
                      ? 'bg-[#d0711a] text-white  font-semibold'
                      : 'bg-transparent text-gray-300 '
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                {tag.icon && (
                  <span
                    className={`
                      ${index === selectedTag ? 'text-white' : 'text-[#d0711a]'}
                      transition-all duration-300 transform group-hover:scale-110 text-base relative z-10
                    `}
                  >
                    {typeof tag.icon === 'string' ? (
                      tag.icon
                    ) : (
                      tag.icon.component && <tag.icon.component size={18} />
                    )}
                  </span>
                )}
                <span className="font-semibold tracking-wide relative z-10">{tag.name}</span>
              </button>
            )) : []}
          </div>
        </div>

      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden space-y-4">
        <div className="flex items-center overflow-hidden w-full">
          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-2 px-1 w-full"
          >
            {Array.isArray(data) ? data.slice(0, 10).map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(index, tag.name)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm 
                  transition-all duration-300 whitespace-nowrap transform active:scale-95 
                  shadow-lg relative overflow-hidden group flex-shrink-0
                  ${
                    index === selectedTag
                      ? 'bg-[#d0711a] text-white font-semibold'
                      : 'bg-transparent text-gray-300 '
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                {tag.icon && (
                  <span
                    className={`
                      ${index === selectedTag ? 'text-white' : 'text-[#d0711a]'}
                      transition-all duration-300 transform group-hover:scale-110 text-base relative z-10
                    `}
                  >
                    {typeof tag.icon === 'string' ? (
                      tag.icon
                    ) : (
                      tag.icon.component && <tag.icon.component size={16} />
                    )}
                  </span>
                )}
                <span className="font-semibold tracking-wide relative z-10">{tag.name}</span>
              </button>
            )) : []}
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            to="/create-prediction"
            className="
              inline-block text-center px-6 py-3
              bg-gradient-to-r from-orange-500 to-orange-600 
              text-white font-semibold text-base 
              rounded-lg shadow-lg 
              hover:shadow-orange-500/40 
              hover:brightness-110 
              transition-all duration-300 
              active:scale-95
            "
          >
            Create Prediction
          </Link>
        </div>
      </div>

      {showScrollIndicator && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
          <div className="w-6 h-6 bg-gray-800/50 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TrendingTags;