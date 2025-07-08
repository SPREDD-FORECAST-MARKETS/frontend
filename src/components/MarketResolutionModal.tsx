/* eslint-disable @typescript-eslint/no-explicit-any */
import { useResolveMarket } from "../hooks/useMarketResolve";
import { MarketOutcomeValues, type Market } from "../lib/interface";
import { useSwitchChain } from "wagmi";
import { baseSepolia } from "viem/chains";
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
          setCurrentStep("Updating market status on backend...");

          if (!market) {
            throw new Error("Market data is missing");
          }

          await resolveMarket(market.id, pendingOutcome);

          setCurrentStep("Market resolved successfully!");
          setSuccess(true);
          setIsProcessing(false);
        } catch (backendError: any) {
          setError(
            `Backend resolution failed: ${
              backendError.message || "Unknown error"
            }`
          );
          setIsProcessing(false);
        }
      }
    },
    onError: (error) => {
      setError(`Blockchain resolution failed: ${error}`);
      setIsProcessing(false);
      setCurrentStep("");
      setPendingOutcome(null);
    },
  });

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isResolving) {
      setCurrentStep("Resolving market on blockchain...");
    } else if (isConfirming) {
      setCurrentStep("Waiting for transaction confirmation...");
    }
  }, [isResolving, isConfirming]);

  const handleResolve = async (outcome: 0 | 1 | 2) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setCurrentStep("");

    try {
      setCurrentStep("Switching to Base Sepolia...");
      await switchChain({ chainId: baseSepolia.id });

      const outcomeTitle =
        outcome === MarketOutcomeValues.OPTION_A ? "YES" : "NO";
      setPendingOutcome(outcomeTitle);

      setCurrentStep("Preparing blockchain transaction...");

      await resolveOnChain(outcome);
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes("User rejected")) {
        setError("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        setError("Insufficient funds for transaction");
      } else {
        setError(error.message || "Failed to resolve market");
      }

      setCurrentStep("");
      setIsProcessing(false);
      setPendingOutcome(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        {/* Subtle Orange Accent */}
        <div className="absolute inset-0  rounded-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing || isResolving || isConfirming}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Resolve Market
          </h2>
          <p className="text-zinc-400 text-sm">
            Select the correct outcome for this prediction market
          </p>
        </div>

        {/* Market Info */}
        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={market.image || "/api/placeholder/40/40"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                {market.question}
              </h3>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Ended{" "}
                  {parseMarketExpiryDate(
                    market.expiry_date
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Status */}
        {isProcessing && currentStep && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-orange-400 text-sm font-medium">
                {currentStep}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-red-400 font-medium text-sm mb-1">
                  Resolution Failed
                </div>
                <div className="text-red-300 text-xs">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-green-400 font-medium text-sm">
                  Market Resolved Successfully!
                </div>
                <div className="text-green-300 text-xs mt-1">
                  The market has been resolved on both blockchain and backend
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleResolve(MarketOutcomeValues.OPTION_A)}
            disabled={isProcessing || isResolving || isConfirming}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {isProcessing || isResolving || isConfirming
                ? "Processing..."
                : "Yes"}
            </span>
          </button>

          <button
            onClick={() => handleResolve(MarketOutcomeValues.OPTION_B)}
            disabled={isProcessing || isResolving || isConfirming}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {isProcessing || isResolving || isConfirming
                ? "Processing..."
                : "No"}
            </span>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={isProcessing || isResolving || isConfirming}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
        >
          {isProcessing || isResolving || isConfirming
            ? "Processing..."
            : "Cancel"}
        </button>
      </div>
    </div>
  );
};
