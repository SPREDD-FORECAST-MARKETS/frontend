import {
  Clock,
  Droplet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useFaucet } from "../hooks/useFaucet";

const ethereum = window.ethereum as any;


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

  const [copiedAddress, setCopiedAddress] = useState(false);

  const TOKEN_ADDRESS = "0x4a2661Ab44eD073Eb8a5834cBcBD287bfB4d1CFF";
  const TOKEN_SYMBOL = "USDT";
  const TOKEN_DECIMALS = 6;

  const handleClaim = async () => {
    try {
      await claimTokens();
    } catch (error) {
      console.error("Claim failed:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const addToMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: TOKEN_ADDRESS,
              symbol: TOKEN_SYMBOL,
              decimals: TOKEN_DECIMALS,
              image: "https://cryptologos.cc/logos/tether-usdt-logo.png",
            },
          },
        });
      } catch (error) {
        console.error("Failed to add token to MetaMask:", error);
      }
    } else {
      copyToClipboard(TOKEN_ADDRESS);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Faucet Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet size={32} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">USDT Faucet</h1>
            <p className="text-zinc-400">
              Claim {claimAmount} USDT every 24 hours
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              Base Sepolia ETH required for gas fees
            </p>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            {/* Countdown Timer */}
            {countdown > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-orange-400 text-sm">
                    Next claim available in:
                  </span>
                </div>
                <div className="text-white font-mono text-lg">
                  {timeRemaining.formatted}
                </div>
              </div>
            )}

            {/* Error States */}
            {!hasSufficientBalance && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" />
                  <span className="text-white text-sm">
                    Insufficient faucet balance
                  </span>
                </div>
              </div>
            )}

            {claimError && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" />
                  <span className="text-white text-sm">
                    Claim failed. Please try again.
                  </span>
                </div>
              </div>
            )}

            {/* Success State */}
            {isClaimSuccess && (
              <div className="bg-zinc-800 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-orange-500" />
                  <span className="text-white text-sm">
                    Successfully claimed {claimAmount} USDT!
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Add Token Button */}
              <button
                onClick={addToMetaMask}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add USDT to Wallet
              </button>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={!canClaim || !hasSufficientBalance || isClaimPending}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  canClaim && hasSufficientBalance && !isClaimPending
                    ? "bg-orange-500 hover:bg-orange-600 text-black"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
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
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-zinc-500 text-xs mb-1">Claim Amount</div>
                <div className="text-white font-bold">{claimAmount} USDT</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1">Cooldown</div>
                <div className="text-white font-bold">24 Hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Contract Info */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-white font-medium mb-3">Token Contract</h3>

          <div className="bg-black rounded-lg p-3 mb-3">
            <div className="text-zinc-500 text-xs mb-1">Contract Address</div>
            <div className="flex items-center gap-2">
              <code className="text-white text-xs font-mono flex-1 break-all">
                {TOKEN_ADDRESS}
              </code>
              <button
                onClick={() => copyToClipboard(TOKEN_ADDRESS)}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
                title="Copy address"
              >
                <Copy
                  size={14}
                  className={
                    copiedAddress ? "text-orange-500" : "text-zinc-500"
                  }
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-zinc-500">Symbol</div>
              <div className="text-white font-medium">{TOKEN_SYMBOL}</div>
            </div>
            <div>
              <div className="text-zinc-500">Decimals</div>
              <div className="text-white font-medium">{TOKEN_DECIMALS}</div>
            </div>
            <div>
              <div className="text-zinc-500">Network</div>
              <div className="text-white font-medium">Base Sepolia</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-zinc-500 text-xs">
            Connect your wallet to claim USDT tokens
          </p>
          {copiedAddress && (
            <p className="text-orange-500 text-xs mt-1">✓ Address copied!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default USDTFaucet;
