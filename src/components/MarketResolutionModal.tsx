import { useResolveMarket } from "../hooks/useMarketResolve";
import { MarketOutcomeValues, type Market } from "../lib/interface";
import { useSwitchChain } from "wagmi";
import { base } from "viem/chains";
import { resolveMarket } from "../apis/market";
import { useEffect, useState } from "react";
import { parseMarketExpiryDate } from "../utils/helpers";

export const MarketResolutionModal = ({
  market,
  isOpen,
  onClose,
}: {
  market: Market;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [pendingOutcome, setPendingOutcome] = useState<string | null>(null);

  const {
    resolveMarket: resolveOnChain,
    isResolving,
    isConfirming,
  } = useResolveMarket({
    marketData: market,
    onSuccess: async () => {
      if (pendingOutcome) {
        try {
          setCurrentStep("Updating market status...");
          if (!market) {
            throw new Error("Market data is missing");
          }
          await resolveMarket(market.id, pendingOutcome);
          setCurrentStep("Market resolved successfully!");
          setSuccess(true);
          setIsProcessing(false);
        } catch (backendError: any) {
          setError(`Failed to update market status: ${backendError.message || "Unknown error"}`);
          setIsProcessing(false);
        }
      }
    },
    onError: (error) => {
      setError(`Blockchain resolution failed: ${error || "Unknown error"}`);
      setIsProcessing(false);
      setCurrentStep("");
      setPendingOutcome(null);
    },
  });

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isResolving) {
      setCurrentStep("Submitting to blockchain...");
    } else if (isConfirming) {
      setCurrentStep("Awaiting confirmation...");
    }
  }, [isResolving, isConfirming]);

  const handleResolve = async (outcome: 0 | 1 | 2) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setCurrentStep("");

    try {
      setCurrentStep("Switching to Base Sepolia...");
      await switchChain({ chainId: base.id });

      const outcomeTitle = outcome === MarketOutcomeValues.OPTION_A ? "YES" : "NO";
      setPendingOutcome(outcomeTitle);

      setCurrentStep("Preparing transaction...");
      await resolveOnChain(outcome);
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || "unknown error";
      if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected by user");
      } else if (errorMessage.includes("insufficient funds")) {
        setError("Insufficient funds for transaction");
      } else {
        setError(errorMessage || "Failed to resolve market");
      }
      setCurrentStep("");
      setIsProcessing(false);
      setPendingOutcome(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className=""
      role="dialog"
      aria-label="Market Resolution Modal"
    >
      <div
        className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-xl p-6 max-w-md w-full animate-fade-in"
        style={{
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >


        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Resolve Market</h2>
          <p className="text-sm text-slate-300">Select the outcome for this market</p>
        </div>

        {/* Market Info */}
        <div className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <img
              src={market.image || "/api/placeholder/40/40"}
              alt="Market image"
              className="w-10 h-10 rounded-lg object-cover border border-orange-500/20"
            />
            <div>
              <h3 className="text-white text-sm font-medium line-clamp-2">{market.question}</h3>
              <p className="text-xs text-slate-400 mt-1">Ended {parseMarketExpiryDate(market.expiry_date).toLocaleDateString()}</p>
              <p className="text-xs text-slate-400">By {market.creator?.username || "Unknown"}</p>
            </div>
          </div>
          {market.description && (
            <div className="mt-3">
              <h4 className="text-xs text-slate-400 font-medium uppercase">Description</h4>
              <p className="text-sm text-slate-300 line-clamp-2">{market.description}</p>
            </div>
          )}
          {market.resolution_criteria && (
            <div className="mt-3">
              <h4 className="text-xs text-slate-400 font-medium uppercase">Resolution Criteria</h4>
              <p className="text-sm text-slate-300 line-clamp-2">{market.resolution_criteria}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Market ID</p>
              <p className="text-sm text-white font-medium">#{market.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Category</p>
              <p className="text-sm text-orange-400 font-medium">{market.tags?.[0] || "General"}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-orange-400">This action is irreversible. Ensure the outcome matches the resolution criteria.</p>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && currentStep && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-orange-400">{currentStep}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-18 0 8 8 0 0118 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-400 font-medium">Resolution Failed</p>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-green-400 font-medium">Market Resolved</p>
                <p className="text-xs text-green-300">Successfully resolved on blockchain and backend</p>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleResolve(MarketOutcomeValues.OPTION_A)}
            disabled={isProcessing || isResolving || isConfirming}
            className={`
              py-3 rounded-lg text-sm font-medium text-orange-400 bg-orange-500/20 border border-orange-500/50
              hover:bg-orange-500/30 hover:shadow-orange-500/20 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-orange-500
            `}
          >
            Yes
          </button>
          <button
            onClick={() => handleResolve(MarketOutcomeValues.OPTION_B)}
            disabled={isProcessing || isResolving || isConfirming}
            className={`
              py-3 rounded-lg text-sm font-medium text-orange-400 bg-orange-500/20 border border-orange-500/50
              hover:bg-orange-500/30 hover:shadow-orange-500/20 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-orange-500
            `}
          >
            No
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={isProcessing || isResolving || isConfirming}
          className={`
            w-full py-3 rounded-lg text-sm font-medium text-white bg-orange-500 border border-slate-600/50
            hover:bg-slate-700/70 hover:shadow-slate-500/20 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-orange-500
          `}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};