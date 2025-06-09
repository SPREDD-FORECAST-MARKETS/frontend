import {
  Clock,
  Droplet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useFaucet } from "../hooks/useFaucet";

const USDTFaucet = () => {
  const {
    claimTokens,
    isClaimPending,
    isClaimSuccess,
    claimError,
    canClaim,
    claimAmount,
    timeRemaining,
    hasSufficientBalance,
    countdown,
  } = useFaucet();

  const handleClaim = async () => {
    try {
      await claimTokens();
    } catch (error) {
      console.error("Claim failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Faucet Card */}
        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">USDT Faucet</h1>
            <p className="text-gray-400 text-sm">
              Claim {claimAmount} USDT every 24 hours
            </p>
          </div>

          {/* Claim Section */}
          <div className="space-y-4">
            {/* Countdown Timer */}
            {countdown > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-orange-400 text-sm font-medium">
                    Next claim available in:
                  </span>
                </div>
                <div className="text-white font-mono text-lg">
                  {timeRemaining.formatted}
                </div>
              </div>
            )}

            {/* Status Messages */}
            {!hasSufficientBalance && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-400 text-sm">
                    Insufficient faucet balance
                  </span>
                </div>
              </div>
            )}

            {isClaimSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-green-400 text-sm">
                    Successfully claimed {claimAmount} USDT!
                  </span>
                </div>
              </div>
            )}

            {claimError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-400 text-sm">
                    Claim failed. Please try again.
                  </span>
                </div>
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || !hasSufficientBalance || isClaimPending}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                canClaim && hasSufficientBalance && !isClaimPending
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-105 shadow-lg hover:shadow-orange-500/20"
                  : "bg-zinc-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isClaimPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Claiming...
                </>
              ) : canClaim && hasSufficientBalance ? (
                <>
                  <Droplet size={18} />
                  Claim {claimAmount} USDT
                </>
              ) : !canClaim ? (
                "Claim on Cooldown"
              ) : (
                "Faucet Empty"
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-xs mb-1">Claim Amount</div>
                <div className="text-white font-bold">{claimAmount} USDT</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Claim Delay</div>
                <div className="text-white font-bold">24 Hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Connect your wallet to claim USDT tokens
          </p>
        </div>
      </div>
    </div>
  );
};

export default USDTFaucet;
