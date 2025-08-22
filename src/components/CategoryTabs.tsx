import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CategoryTabItem {
  id: number;
  name: string;
}

interface CategoryTabsProps {
  items?: CategoryTabItem[];
  className?: string;
  onCategoryChange?: (category: string | undefined) => void;
  activeCategory?: string | undefined;
}

export function CategoryTabs({ 
  items, 
  className = "", 
  onCategoryChange,
  activeCategory 
}: CategoryTabsProps) {
  const defaultItems: CategoryTabItem[] = [
    { id: 1, name: "All" },
    { id: 2, name: "Top" },
    { id: 3, name: "NBA" },
    { id: 4, name: "Technology" },
    { id: 5, name: "Environment" },
    { id: 6, name: "Bitcoin" },
    { id: 7, name: "Sports" },
    { id: 8, name: "AI" },
    { id: 9, name: "Crypto" },
    { id: 10, name: "Business" },
  ];

  const tabItems = items || defaultItems;
  
  // Find active item based on activeCategory prop or default to first item
  const getActiveItem = () => {
    if (activeCategory === undefined) {
      return tabItems[0]; 
    }
    return tabItems.find(item => item.name === activeCategory) || tabItems[0];
  };

  const [active, setActive] = useState<CategoryTabItem>(getActiveItem());
  const [isHover, setIsHover] = useState<CategoryTabItem | null>(null);

  // Update active state when activeCategory prop changes
  useEffect(() => {
    setActive(getActiveItem());
  }, [activeCategory]);

  const handleCategoryClick = (item: CategoryTabItem) => {
    setActive(item);
    // Pass undefined for "All", otherwise pass the category name
    const categoryValue = item.name === "All" ? undefined : item.name;
    onCategoryChange?.(categoryValue);
  };

  return (
    <div className={`w-full mb-8 ${className}`}>
      {/* Desktop view */}
      <div className="hidden md:block w-full bg-[#131314f2] border border-gray-800/50 rounded-2xl p-2 backdrop-blur-xl">
        <div className="flex items-center justify-between w-full gap-1">
          {tabItems.map((item) => (
            <button
              key={item.id}
              className={`
                relative flex-1 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl whitespace-nowrap text-center
                ${active.id === item.id
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
                }
              `}
              onClick={() => handleCategoryClick(item)}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span className="relative z-10">{item.name}</span>
              
              {/* Active background */}
              {active.id === item.id && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              
              {/* Hover background */}
              {isHover?.id === item.id && active.id !== item.id && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 bg-gray-800/50 rounded-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile view - scrollable */}
      <div className="md:hidden w-full bg-[#131314f2] border border-gray-800/50 rounded-2xl p-2 backdrop-blur-xl">
        <div className="flex overflow-x-auto gap-2 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabItems.map((item) => (
            <button
              key={item.id}
              className={`
                relative flex-shrink-0 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl whitespace-nowrap
                ${active.id === item.id
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
                }
              `}
              onClick={() => handleCategoryClick(item)}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span className="relative z-10">{item.name}</span>
              
              {/* Active background */}
              {active.id === item.id && (
                <motion.div
                  layoutId="active-bg-mobile"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              
              {/* Hover background */}
              {isHover?.id === item.id && active.id !== item.id && (
                <motion.div
                  layoutId="hover-bg-mobile"
                  className="absolute inset-0 bg-gray-800/50 rounded-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}