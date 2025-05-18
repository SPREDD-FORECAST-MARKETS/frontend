import type { MarketCard } from "../lib/interface";

interface MarketCardsProps {
  data: MarketCard[];
}

const MarketCards = ({ data }: MarketCardsProps) => {
  const hasBuyOptions = data.some((card) => card.buyOptions !== undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 m-[2rem]">
      {data.map((data, index) => {
        const optionsCount = data.options?.length || 0;
        const minContentHeight = Math.max(40 * optionsCount, 120); 
        return (
          <div
            key={index}
            className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl border border-zinc-800 overflow-hidden shadow-xl relative h-[340px] flex flex-col p-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 via-transparent to-transparent pointer-events-none"></div>

            <div className="p-4 pb-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded overflow-hidden bg-gradient-to-br from-zinc-800 to-black">
                <img
                  src={data.icon}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-bold text-xl flex-1">
                {data.title}
              </h3>
            </div>

            <div
              className="p-[1rem] overflow-auto flex-grow"
              style={{ minHeight: minContentHeight }}
            >
              {data.options &&
                data.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-3 group hover:bg-orange-500/5 px-2 py-1 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-white text-md">{option.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm">
                        {option.percentage}
                      </span>
                      <div className="flex gap-1">
                        <button className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 px-2 py-0.5 rounded text-xs text-white transition-all duration-200 hover:shadow-md hover:shadow-green-600/30">
                          Yes
                        </button>
                        <button className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 px-2 py-0.5 rounded text-xs text-white transition-all duration-200 hover:shadow-md hover:shadow-red-600/30">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-auto px-[1rem] py-3">
              {hasBuyOptions && (
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 py-2 rounded text-sm text-white flex items-center justify-center gap-1 transition-all duration-200 hover:shadow-md hover:shadow-green-600/30 group">
                    <span>Buy Yes</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:translate-y-0.5 transition-transform duration-200"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <button className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 py-2 rounded text-sm text-white flex items-center justify-center gap-1 transition-all duration-200 hover:shadow-md hover:shadow-red-600/30 group">
                    <span>Buy No</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:translate-y-0.5 transition-transform duration-200"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="px-4 py-2 mt-1 flex justify-between items-center border-t border-zinc-800/50 bg-black/20">
              <span className="text-zinc-500 text-xs">{data.volume}</span>
              {data.timeframe && (
                <span className="text-zinc-500 text-xs flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {data.timeframe}
                </span>
              )}
              <div className="flex gap-2">
                <button className="text-zinc-500 hover:text-orange-500 transition-colors hover:scale-110 duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3h18v18H3zM8 12h8" />
                  </svg>
                </button>
                <button className="text-zinc-500 hover:text-orange-500 transition-colors hover:scale-110 duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketCards;
