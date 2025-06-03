import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKET_ABI } from "../abi/MarketABI";
import { FACTORY_ABI } from "../abi/FactoryABI";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { type Address, decodeEventLog, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { baseSepolia } from "viem/chains";

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
  const publicClient = usePublicClient();

  // Extract market address from transaction receipt
  useEffect(() => {
    const extractMarketAddress = async () => {
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

              // Assuming the factory ABI has a MarketCreated event with market address
              if (decodedLog.eventName === "MarketCreated") {
                const marketAddr =
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (decodedLog.args as any).market ||
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (decodedLog.args as any).marketAddress;
                if (marketAddr) {
                  setMarketAddress(marketAddr as Address);
                  console.log("Market address extracted:", marketAddr);
                  break;
                }
              }
            } catch (error) {
              console.error("Error decoding log:", error);
              continue;
            }
          }
        } catch (error) {
          console.error("Error extracting market address:", error);
        }
      }
    };

    extractMarketAddress();
  }, [isSuccess, receipt, publicClient]);

  const createMarket = async (
    question: string,
    optionA: string,
    optionB: string,
    durationDays: number
  ) => {
    const factoryAddress = CONTRACT_ADDRESSES.factory || "";
    console.log("Factory Address:", factoryAddress);
    if (!factoryAddress) throw new Error("Factory not deployed on this chain");

    console.log(factoryAddress, question, optionA, optionB, durationDays);

    // Reset market address when creating new market
    setMarketAddress(null);

    return await writeContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "createMarket",
      args: [question, optionA, optionB, durationDays],
    });
  };

  return {
    createMarket,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    marketAddress, // Return the extracted market address
  };
}

export function useInitializeMarket() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const initializeMarket = (
    marketAddress: Address,
    initialLiquidity: string
  ) => {

    if (!marketAddress) {
      throw new Error("Market address is required");
    }
    const parsedAmount = parseUnits(initialLiquidity, 6);

    return writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "initializeMarket",
      args: [parsedAmount]
    });
  };

  return {
    initializeMarket,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}
