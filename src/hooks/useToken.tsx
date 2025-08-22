import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem/utils";
import { useState } from "react";

// Official USDC address on Base mainnet
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

export function useUsdcToken() {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { writeContractAsync, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: { enabled: !!txHash },
  });

  const approve = async ({
    spender,
    usdAmount, // in float like 10.5
    decimals = 6,
  }: {
    spender: `0x${string}`;
    usdAmount: number;
    decimals?: number;
  }) => {
    const parsedAmount = parseUnits(usdAmount.toString(), decimals);
    
    const hash = await writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, parsedAmount],
    });
    
    setTxHash(hash);
    return hash;
  };

  return { 
    approve, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    USDC_ADDRESS // Export the address for reference
  };
}