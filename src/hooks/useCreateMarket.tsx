import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKET_ABI } from "../abi/MarketABI";
import { FACTORY_ABI } from "../abi/FactoryABI";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { type Address, decodeEventLog, formatUnits, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { useUsdtToken } from "./useToken";

export function useCreateMarket() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [marketAddress, setMarketAddress] = useState<Address | null>(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const { approve } = useUsdtToken();


  useEffect(() => {
    const extractMarketData = async () => {
      if (isSuccess && receipt && publicClient) {
        try {
          // Look for MarketCreated event in the transaction logs
          for (const log of receipt.logs) {
            try {
              const decodedLog = decodeEventLog({
                abi: FACTORY_ABI,
                data: log.data,
                topics: log.topics,
              });

              // Based on your factory ABI, the MarketCreated event has these indexed fields:
              // marketId (bytes32), marketContract (address), owner (address)
              if (decodedLog.eventName === "MarketCreated") {
                const args = decodedLog.args as any;

                // Extract marketId (bytes32) and marketContract (address)
                if (args.marketId) {
                  setMarketId(args.marketId);
                }
                if (args.marketContract) {
                  setMarketAddress(args.marketContract as Address);
                }
                break;
              }
            } catch (error) {
              console.error("Error decoding log:", error);
              continue;
            }
          }
        } catch (error) {
          console.error("Error extracting market data:", error);
        }
      }
    };

    extractMarketData();
  }, [isSuccess, receipt, publicClient]);

  const createMarket = async (
    question: string,
    optionA: string,
    optionB: string,
    endTime: number // Changed from durationDays to endTime (Unix timestamp)
  ) => {
    const factoryAddress = CONTRACT_ADDRESSES.factory || "";
    if (!factoryAddress) throw new Error("Factory not deployed on this chain");

    // Reset previous state
    setMarketAddress(null);
    setMarketId(null);

    // Get the market creation fee first
    const fee = await publicClient?.readContract({
      address: factoryAddress as Address,
      abi: FACTORY_ABI,
      functionName: "getMarketCreationFee",
    });

    console.log("Market creation fee:", fee);

    await approve({
      tokenAddress: CONTRACT_ADDRESSES.token as `0x${string}`,
      spender: factoryAddress as `0x${string}`,
      usdAmount: parseInt(formatUnits(BigInt(fee as string), 6)),
      decimals: 6,
    });

    await writeContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "createMarket",
      args: [question, optionA, optionB, endTime],
    });

    return
  };

  return {
    createMarket,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    marketAddress,
    marketId, // Also return the market ID
  };
}

export function useInitializeMarket() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const initializeMarket = async (
    marketAddress: Address,
    initialLiquidity: string
  ) => {
    if (!marketAddress) {
      throw new Error("Market address is required");
    }

    const parsedAmount = parseUnits(initialLiquidity, 6); // Assuming 6 decimals for USDC

    return await writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "initializeMarket",
      args: [parsedAmount],
    });
  };

  return {
    initializeMarket,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

// Additional hook to handle the complete market creation flow
export function useCreateAndInitializeMarket() {
  const { createMarket, isPending: isCreating, isSuccess: isCreated, marketAddress } = useCreateMarket();
  const { initializeMarket, isPending: isInitializing, isSuccess: isInitialized } = useInitializeMarket();

  const [isComplete, setIsComplete] = useState(false);

  // Auto-initialize market after creation if initialLiquidity is provided
  useEffect(() => {
    if (isCreated && marketAddress && !isComplete) {
      // You could auto-initialize here if needed, or leave it manual
      setIsComplete(true);
    }
  }, [isCreated, marketAddress, isComplete]);

  const createAndInitializeMarket = async (
    question: string,
    optionA: string,
    optionB: string,
    endTime: number,
    initialLiquidity?: string
  ) => {
    try {
      // Step 1: Create market
      await createMarket(question, optionA, optionB, endTime);

      // Step 2: Initialize market (if initial liquidity provided)
      if (initialLiquidity && marketAddress) {
        await initializeMarket(marketAddress, initialLiquidity);
      }
    } catch (error) {
      console.error("Error in market creation flow:", error);
      throw error;
    }
  };

  return {
    createAndInitializeMarket,
    createMarket,
    initializeMarket,
    isPending: isCreating || isInitializing,
    isCreating,
    isInitializing,
    isCreated,
    isInitialized,
    isComplete,
    marketAddress,
  };
}