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
    { id: 1, name: "Top" },
    { id: 2, name: "NBA" },
    { id: 3, name: "Technology" },
    { id: 4, name: "Environment" },
    { id: 5, name: "Bitcoin" },
    { id: 6, name: "Sports" },
    { id: 7, name: "AI" },
    { id: 8, name: "Crypto" },
    { id: 9, name: "Business" },
  ];

  const tabItems = items || defaultItems;
  
  // Find active item based on activeCategory prop or default to first item
  const getActiveItem = () => {
    if (activeCategory === undefined) {
      return tabItems[0]; // "Top"
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
    // Pass undefined for "Top", otherwise pass the category name
    const categoryValue = item.name === "Top" ? undefined : item.name;
    onCategoryChange?.(categoryValue);
  };

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="w-full bg-zinc-900/50 border border-slate-600/60 rounded-lg p-1.5 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full">
          {tabItems.map((item) => (
            <button
              key={item.id}
              className={`
                relative flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md whitespace-nowrap text-center
                ${active.id === item.id
                  ? "text-white"
                  : "text-zinc-300 hover:text-white"
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
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/80 to-orange-600/80 rounded-md shadow-sm shadow-orange-500/20"
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
                  className="absolute inset-0 bg-zinc-800/60 rounded-md"
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