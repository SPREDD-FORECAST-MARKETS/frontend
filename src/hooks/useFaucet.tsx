// hooks/useFaucet.ts
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { FAUCET_ABI } from "../abi/FaucetABI";
import { type Address, parseUnits, formatUnits } from "viem";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

// Add this to your CONTRACT_ADDRESSES in wagmiConfig
const FAUCET_ADDRESS = "0x1A579f3BD50971F2e1aCd8cd0C5162AaE52003F7" as Address; // Replace with your deployed faucet address

export function useClaimTokens() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const claimTokens = async () => {
    if (!FAUCET_ADDRESS) throw new Error("Faucet not deployed on this chain");

    return await writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "claimTokens",
      args: [],
    });
  };

  return {
    claimTokens,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error: receiptError,
  };
}

export function useRefillFaucet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const refillFaucet = async (amount: string) => {
    if (!FAUCET_ADDRESS) throw new Error("Faucet not deployed on this chain");

    const parsedAmount = parseUnits(amount, 6); // USDT has 6 decimals

    return await writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "refillFaucet",
      args: [parsedAmount],
    });
  };

  return {
    refillFaucet,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error: receiptError,
  };
}

export function useEmergencyWithdraw() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const emergencyWithdraw = async () => {
    if (!FAUCET_ADDRESS) throw new Error("Faucet not deployed on this chain");

    return await writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "emergencyWithdraw",
      args: [],
    });
  };

  return {
    emergencyWithdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error: receiptError,
  };
}

export function useFaucetInfo(userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  // Read faucet balance
  const { data: faucetBalance } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getFaucetBalance",
  });

  // Read if user can claim
  const { data: canClaim } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "canClaim",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Read time until next claim
  const { data: timeUntilNextClaim } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getTimeUntilNextClaim",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Read last claim time
  const { data: lastClaimTime } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getLastClaimTime",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Read if faucet has sufficient balance
  const { data: hasSufficientBalance } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "hasSufficientBalance",
  });

  // Read claim amount constant
  const { data: claimAmount } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "CLAIM_AMOUNT",
  });

  // Read claim delay constant
  const { data: claimDelay } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "CLAIM_DELAY",
  });

  return {
    faucetBalance:
      faucetBalance && typeof faucetBalance === "string"
        ? formatUnits(BigInt(faucetBalance), 6)
        : "0",
    faucetBalanceRaw: faucetBalance,
    canClaim: canClaim || false,
    timeUntilNextClaim: timeUntilNextClaim ? Number(timeUntilNextClaim) : 0,
    lastClaimTime: lastClaimTime ? Number(lastClaimTime) : 0,
    hasSufficientBalance: hasSufficientBalance || false,
    claimAmount:
      claimAmount && typeof claimAmount === "string"
        ? formatUnits(BigInt(claimAmount), 6)
        : "50",
    claimAmountRaw: claimAmount,
    claimDelay: claimDelay ? Number(claimDelay) : 86400, // 24 hours in seconds
  };
}

export function useClaimCountdown(userAddress?: Address) {
  const { timeUntilNextClaim } = useFaucetInfo(userAddress);
  const [countdown, setCountdown] = useState(timeUntilNextClaim);

  useEffect(() => {
    setCountdown(timeUntilNextClaim);
  }, [timeUntilNextClaim]);

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours,
      minutes,
      seconds: secs,
      formatted: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
    };
  };

  return {
    countdown,
    timeRemaining: formatTime(countdown),
    canClaim: countdown === 0,
  };
}

// Combined hook for easy usage
export function useFaucet(userAddress?: Address) {
  const claimHook = useClaimTokens();
  const refillHook = useRefillFaucet();
  const emergencyHook = useEmergencyWithdraw();
  const infoHook = useFaucetInfo(userAddress);
  const countdownHook = useClaimCountdown(userAddress);

  return {
    // Claim functionality
    claimTokens: claimHook.claimTokens,
    isClaimPending: claimHook.isPending,
    isClaimSuccess: claimHook.isSuccess,
    claimHash: claimHook.hash,
    claimError: claimHook.error,

    // Refill functionality (owner only)
    refillFaucet: refillHook.refillFaucet,
    isRefillPending: refillHook.isPending,
    isRefillSuccess: refillHook.isSuccess,
    refillHash: refillHook.hash,
    refillError: refillHook.error,

    // Emergency withdraw (owner only)
    emergencyWithdraw: emergencyHook.emergencyWithdraw,
    isEmergencyPending: emergencyHook.isPending,
    isEmergencySuccess: emergencyHook.isSuccess,
    emergencyHash: emergencyHook.hash,
    emergencyError: emergencyHook.error,

    // Faucet info
    ...infoHook,

    // Countdown
    ...countdownHook,
  };
}
