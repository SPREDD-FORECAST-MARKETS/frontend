import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem/utils'
import { useState } from 'react'
import { TOKEN_ABI } from '../abi/TokenABI'

export function useUsdtToken() {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const { writeContract, data, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: { enabled: !!txHash },
  })

  const approve = ({
    tokenAddress,
    spender,
    usdAmount, // in float like 10.5
    decimals = 6,
  }: {
    tokenAddress: `0x${string}`
    spender: `0x${string}`
    usdAmount: number
    decimals?: number
  }) => {
    const parsedAmount = parseUnits(usdAmount.toString(), decimals)

    writeContract(
      {
        address: tokenAddress,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [spender, parsedAmount],
      },
      {
        onSuccess: (data) => setTxHash(data),
      }
    )
  }

  return { approve, isPending, isConfirming, isSuccess, error }
}
