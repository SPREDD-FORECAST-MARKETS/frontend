import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import type { TrendingTagsData } from '../lib/interface';

interface TrendingTagsProps {
  data: TrendingTagsData[]
}

const TrendingTags = ({data}:TrendingTagsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
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
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced scroll right handler with visibility checking
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If near the end, scroll to end, otherwise scroll a fixed amount
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
      
      // If near the start, scroll to start, otherwise scroll a fixed amount
      if (container.scrollLeft < 250) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -250, behavior: 'smooth' });
      }
    }
  };

  // Handle tag selection with smooth scroll into view
  const handleTagSelect = (index: number) => {
    setSelectedTag(index);
    
    // Scroll tag into view if needed
    const tagElements = scrollContainerRef.current?.children;
    if (tagElements && tagElements[index]) {
      const tagElement = tagElements[index] as HTMLElement;
      const container = scrollContainerRef.current;
      
      // Check if element is not fully visible
      if (container) {
        const tagLeft = tagElement.offsetLeft;
        const tagRight = tagElement.offsetLeft + tagElement.offsetWidth;
        const containerLeft = container.scrollLeft;
        const containerRight = container.scrollLeft + container.clientWidth;
        
        // If tag is not fully visible, scroll to make it visible
        if (tagLeft < containerLeft || tagRight > containerRight) {
          // Add some padding to ensure it's not right at the edge
          const scrollTo = tagLeft - 40;
          container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div className='relative flex justify-center overflow-hidden' ref={containerRef}>
      {/* Main tag navigation bar with optimized spacing - removed gradients */}
      <div className="flex items-center justify-between px-4 py-2 w-[98%] relative">
        {/* Left scrollable content with scroll buttons */}
        <div className="flex items-center flex-grow overflow-hidden relative">
          {/* Left scroll button (conditionally visible) */}
          {scrollPosition > 10 && (
            <button 
              className="flex-shrink-0 mr-2 p-1.5 rounded-full bg-zinc-800/90 text-white hover:bg-zinc-700 transition-all duration-300 hover:shadow-lg z-10 backdrop-blur-sm"
              onClick={scrollLeft}
            >
              <ChevronRight size={20} className="rotate-180 transform transition-transform hover:-translate-x-0.5 duration-200" />
            </button>
          )}
          
          {/* Tags container - reduced vertical padding */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center space-x-3 overflow-x-auto scrollbar-hide py-1 pl-[1rem] pr-[1rem]"
          >
            {data.map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(index)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-serif text-lg
                  ${index === selectedTag 
                    ? 'bg-orange-500 text-white shadow-md font-medium' 
                    : 'bg-[#1a1a1a] text-white hover:bg-zinc-700 font-semibold'}
                  transition-all duration-300 whitespace-nowrap transform hover:scale-105 hover:shadow-md`}
              >
                {tag.icon && (
                  <span className={`${index === selectedTag ? 'text-white' : 'text-orange-500'} transition-all duration-300`}>
                    {typeof tag.icon === 'string'
                      ? tag.icon
                      : tag.icon.component && <tag.icon.component size={tag.icon.size || 20} />}
                  </span>
                )}
                {tag.name}
              </button>
            ))}
          </div>
          
          {/* Right arrow button for scrolling */}
          {showScrollIndicator && scrollContainerRef.current && 
            scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) && (
            <button 
              className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-zinc-800/90 text-white hover:bg-zinc-700 transition-all duration-300 hover:shadow-lg z-10 backdrop-blur-sm"
              onClick={scrollRight}
            >
              <ChevronRight size={20} className="transform transition-transform hover:translate-x-0.5 duration-200" />
            </button>
          )}
          
          {/* Simplified gradient fade at the edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0c0c0c] to-transparent pointer-events-none z-[5]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0c0c0c] to-transparent pointer-events-none z-[5]"></div>
        </div>
        
        {/* Right side controls - optimized spacing */}
        <div className="flex items-center gap-3 ml-3 pl-5 border-l border-zinc-700/40 relative z-10">
          {/* Trending dropdown */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-white font-medium text-base group transition-all duration-300 px-3 py-1 rounded-lg hover:bg-zinc-800/50"
            >
              <span className="text-white font-semibold">Trending</span>
              <ChevronDown 
                size={18} 
                className={`text-orange-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} 
              />
            </button>
          </div>
          
          {/* View toggle buttons - commented out */}
          {/* 
          <div className="flex bg-[#0c0c0c] rounded-md ml-2 p-1 border border-zinc-800/50 shadow-inner shadow-black/50">
            <button 
              className={`p-1.5 rounded-l ${viewMode === 'list' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-white'} transition-all duration-300`}
              onClick={() => setViewMode('list')}
            >
              <Grid size={18} className="transform transition-transform duration-300 hover:scale-110" />
            </button>
            <button 
              className={`p-1.5 rounded-r ${viewMode === 'grid' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-white'} transition-all duration-300`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} className="transform transition-transform duration-300 hover:scale-110" />
            </button>
          </div>
          */}
        </div>
      </div>
      
      {/* Enhanced dropdown menu with animations */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-5 mt-2 grid grid-cols-3 gap-2.5 p-4 bg-gradient-to-br from-[#151515] to-[#0c0c0c] rounded-xl border border-zinc-700/30 shadow-2xl z-50 w-[400px] animate-fadeIn"
          style={{ top: '100%' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="col-span-3 flex justify-between items-center mb-2 pb-2 border-b border-zinc-800/50">
            <h3 className="text-white text-sm font-medium">All Categories</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-zinc-800/50 transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>
          
          {data.map((tag, index) => (
            <button
              key={`dropdown-${index}`}
              onClick={() => {
                handleTagSelect(index);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg ${selectedTag === index 
                ? 'bg-gradient-to-br from-orange-600/20 to-orange-700/20 text-orange-400 border border-orange-700/30' 
                : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'} 
              transition-all duration-300 text-sm font-medium transform hover:scale-105 group z-10`}
            >
              {tag.icon && (
                <span className={`${selectedTag === index ? 'text-orange-400' : 'text-orange-500'} transition-all duration-300 group-hover:rotate-12`}>
                  {typeof tag.icon === 'string'
                    ? tag.icon
                    : tag.icon.component && <tag.icon.component size={tag.icon.size} />}
                </span>
              )}
              <span className="truncate">{tag.name}</span>
            </button>
          ))}
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
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default TrendingTags;
