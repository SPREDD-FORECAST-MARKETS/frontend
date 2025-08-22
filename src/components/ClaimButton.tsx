import { useClaimWinnings } from "../hooks/useClaimWinnings";
import { CheckCircle, DollarSign, Loader2, AlertCircle } from "lucide-react";

interface ClaimButtonProps {
  marketAddress: string;
  userAddress: string;
  marketQuestion?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ClaimButton = ({
  marketAddress,
  userAddress,
  className = "",
  size = "sm",
}: ClaimButtonProps) => {
  const {
    winningsData,
    isCheckingWinnings,
    winningsError,
    isClaimingWinnings,
    claimError,
    claimWinnings,
    formattedTotalPayout,
    formattedWinnings,
  } = useClaimWinnings(marketAddress, userAddress);

  // Button sizing classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  // Handle loading state while checking winnings
  if (isCheckingWinnings) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} bg-gray-800 text-gray-400 rounded-lg border border-gray-700 flex items-center gap-2 transition-all duration-300 ${className}`}
      >
        <Loader2 size={iconSizes[size]} className="animate-spin" />
        Checking...
      </button>
    );
  }

  // Handle error state
  if (winningsError || claimError) {
    const errorMessage = winningsError?.message || claimError?.message || "Error occurred";
    
    // Don't show error for common cases like market not resolved or no position
    if (errorMessage.includes("execution reverted") || 
        errorMessage.includes("Market not resolved") ||
        errorMessage.includes("No bets found")) {
      return null;
    }
    
    return (
      <button
        disabled
        className={`${sizeClasses[size]} bg-red-900/20 text-red-400 rounded-lg border border-red-800/50 flex items-center gap-2 transition-all duration-300 ${className}`}
        title={errorMessage}
      >
        <AlertCircle size={iconSizes[size]} />
        Error
      </button>
    );
  }

  // Handle case where user has no winnings or already claimed
  if (!winningsData?.canClaim) {
    // Check if user has any position in this market
    const hasPosition = winningsData && (winningsData.originalBet > 0n || winningsData.totalPayout > 0n);
    
    if (hasPosition && winningsData.winnings === 0n) {
      // User participated but didn't win
      return (
        <button
          disabled
          className={`${sizeClasses[size]} bg-gray-800/50 text-gray-500 rounded-lg border border-gray-700/50 flex items-center gap-2 transition-all duration-300 ${className}`}
        >
          <CheckCircle size={iconSizes[size]} />
          No Winnings
        </button>
      );
    }
    
    if (hasPosition) {
      // User already claimed
      return (
        <button
          disabled
          className={`${sizeClasses[size]} bg-green-900/20 text-green-400 rounded-lg border border-green-800/50 flex items-center gap-2 transition-all duration-300 ${className}`}
        >
          <CheckCircle size={iconSizes[size]} />
          Claimed
        </button>
      );
    }
    
    // User has no position in this market
    return null;
  }

  // Handle claimable winnings
  const totalPayoutNum = parseFloat(formattedTotalPayout);
  const winningsNum = parseFloat(formattedWinnings);

  return (
    <button
      onClick={claimWinnings}
      disabled={isClaimingWinnings}
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-r from-green-600 to-green-700 
        hover:from-green-700 hover:to-green-800 
        disabled:from-green-800 disabled:to-green-900
        text-white font-semibold rounded-lg 
        border border-green-500/30 
        hover:border-green-400/50
        disabled:border-green-700/30
        flex items-center gap-2 
        transition-all duration-300 
        transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20
        disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
      title={
        winningsNum > 0 
          ? `Claim ${totalPayoutNum.toFixed(2)} USDC (${winningsNum.toFixed(2)} profit + original bet)`
          : `Claim ${totalPayoutNum.toFixed(2)} USDC`
      }
    >
      {isClaimingWinnings ? (
        <>
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <DollarSign size={iconSizes[size]} />
          Claim {totalPayoutNum.toFixed(2)} USDC
        </>
      )}
    </button>
  );
};

export default ClaimButton;