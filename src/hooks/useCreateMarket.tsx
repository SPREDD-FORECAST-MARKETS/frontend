import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ABI } from "../abi/FactoryABI";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { type Address, decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import { useState, useEffect } from "react";

// USDC contract address on Base mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// Standard ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export function useCreateMarket() {
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [marketAddress, setMarketAddress] = useState<Address | null>(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [marketCreationHash, setMarketCreationHash] = useState<`0x${string}` | null>(null);
  
  const publicClient = usePublicClient();

  // Watch for the market creation transaction receipt (not approval)
  const { data: receipt, isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: marketCreationHash ?? undefined,
    query: { enabled: !!marketCreationHash }
  });

  // Extract market data from the market creation transaction receipt
  useEffect(() => {
    const extractMarketData = async () => {
      if (!isSuccess || !receipt || !publicClient) return;

      console.log("Processing market creation receipt with", receipt.logs.length, "logs");
      
      const factoryAddress = CONTRACT_ADDRESSES.factory?.toLowerCase();
      if (!factoryAddress) return;

      // Correct event ABI matching your contract
      const correctMarketCreatedEvent = {
        anonymous: false,
        inputs: [
          { indexed: true, name: "marketId", type: "bytes32" },
          { indexed: true, name: "marketContract", type: "address" },
          { indexed: true, name: "owner", type: "address" },
          { indexed: false, name: "token", type: "address" },
          { indexed: false, name: "question", type: "string" },
          { indexed: false, name: "optionA", type: "string" },
          { indexed: false, name: "optionB", type: "string" },
          { indexed: false, name: "endTime", type: "uint256" }
        ],
        name: "MarketCreated",
        type: "event"
      };

      for (const log of receipt.logs) {
        // Only process logs from the factory contract
        if (log.address.toLowerCase() !== factoryAddress) {
          continue;
        }

        try {
          const decoded = decodeEventLog({
            abi: [correctMarketCreatedEvent],
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "MarketCreated") {
            const args = decoded.args as any;
            setMarketId(args.marketId);
            setMarketAddress(args.marketContract);
            
            console.log("Market creation successful:", {
              marketId: args.marketId,
              marketContract: args.marketContract,
              owner: args.owner,
              endTime: args.endTime
            });
            
            break;
          }
        } catch (error) {
          console.error("Error decoding MarketCreated event:", error);
          
          // Fallback: Manual extraction from topics
          if (log.topics.length >= 4) {
            const marketId = log.topics[1];
            const marketContract = log.topics[2] ? `0x${log.topics[2].slice(-40)}` : null;
            
            if (marketId) {
              setMarketId(marketId);
            }
            setMarketAddress(marketContract as Address);
            
            console.log("Manual extraction successful:", {
              marketId,
              marketContract
            });
            
            break;
          }
        }
      }
    };

    extractMarketData();
  }, [isSuccess, receipt, publicClient]);

  const createMarket = async (
    question: string,
    optionA: string,
    optionB: string,
    endTime: number
  ) => {
    const factoryAddress = CONTRACT_ADDRESSES.factory || "";
    console.log("Factory address:", factoryAddress);
    if (!factoryAddress) throw new Error("Factory not deployed on this chain");
  const chainId = await publicClient?.getChainId()
  console.log("Current chain ID:", chainId);

    setIsLoading(true);
    
    try {
      // Reset previous state
      setMarketAddress(null);
      setMarketId(null);
      setMarketCreationHash(null);

      // Step 1: Get the market creation fee



      console.log("Fetching market creation fee...",factoryAddress);

      const fee = await publicClient?.readContract({
        address: factoryAddress as Address,
        abi: FACTORY_ABI,
        functionName: "getMarketCreationFee",
      });

      console.log("Market creation fee:", fee);

      if (!fee) {
        throw new Error("Could not fetch market creation fee");
      }

      const feeAmount = BigInt(fee.toString());

      // Step 2: Approve USDC spending
      console.log("Approving USDC spending...");
      const approvalTx = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [factoryAddress as Address, feeAmount],
      });

      console.log("Approval transaction completed:", approvalTx);

      // Step 3: Create the market
      console.log("Creating market...");
      const createTx = await writeContractAsync({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createMarket",
        args: [question, optionA, optionB, endTime],
      });

      console.log("Market creation transaction:", createTx);
      
      // Set the market creation hash to watch for receipt
      setMarketCreationHash(createTx);

      return { approvalTx, createTx };

    } catch (error) {
      console.error("Error in market creation process:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMarket,
    isLoading: isLoading || isConfirming,
    isSuccess,
    hash: marketCreationHash, // Return the market creation hash for the form component
    marketAddress,
    marketId,
    receipt // Export receipt so form component can use it
  };
}