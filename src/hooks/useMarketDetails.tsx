import { useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ABI } from "../abi/FactoryABI";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { type Address, type Abi } from "viem";
import { useMemo } from "react";
import { marketIdToBytes32, basisPointsToPercentage, isValidMarketId } from "../utils/contractUtils";

// Hook to get market odds for a specific market
export function useMarketOdds(marketId: string | null) {
  const formattedMarketId = useMemo(() => {
    if (!marketId || !isValidMarketId(marketId)) return undefined;
    try {
      return marketIdToBytes32(marketId);
    } catch (error) {
      console.error("Error converting marketId to bytes32:", error, "marketId:", marketId);
      return undefined;
    }
  }, [marketId]);

  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.factory as Address,
    abi: FACTORY_ABI,
    functionName: "getMarketOdds",
    args: formattedMarketId ? [formattedMarketId] : undefined,
    query: {
      enabled: !!formattedMarketId && !!CONTRACT_ADDRESSES.factory,
      refetchInterval: 10000, // Refetch every 10 seconds for real-time odds
    },
  });

  const formattedOdds = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      if (isError) {
        console.warn("useMarketOdds: Contract call failed", { marketId, isError });
      }
      return null;
    }

    const [oddsA, oddsB, totalVolume] = data;
    const numOddsA = Number(oddsA);
    const numOddsB = Number(oddsB);
    const numTotalVolume = Number(totalVolume);

    return {
      oddsA: numOddsA,
      oddsB: numOddsB,
      totalVolume: numTotalVolume,
      // Convert from basis points to percentage - contract returns oddsA/oddsB in basis points
      probabilityA: numTotalVolume > 0 ? basisPointsToPercentage(numOddsA) : 50,
      probabilityB: numTotalVolume > 0 ? basisPointsToPercentage(numOddsB) : 50,
    };
  }, [data, isError, marketId, formattedMarketId]);

  return {
    data: formattedOdds,
    isError,
    isLoading,
    refetch,
  };
}

export function useMarketDetails(marketId: string | null) {
  const formattedMarketId = useMemo(() => {
    if (!marketId || !isValidMarketId(marketId)) return undefined;
    try {
      return marketIdToBytes32(marketId);
    } catch (error) {
      console.error("Error converting marketId to bytes32:", error, "marketId:", marketId);
      return undefined;
    }
  }, [marketId]);

  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.factory as Address,
    abi: FACTORY_ABI,
    functionName: "getMarketDetails",
    args: formattedMarketId ? [formattedMarketId] : undefined,
    query: {
      enabled: !!formattedMarketId && !!CONTRACT_ADDRESSES.factory,
      refetchInterval: 15000,
    },
  });

  const formattedDetails = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      if (isError) {
        console.warn("useMarketDetails: Contract call failed", { marketId, isError });
      }
      return null;
    }

    const [
      question,
      optionA,
      optionB,
      endTime,
      resolved,
      volumeA,
      volumeB,
      totalVolume,
      oddsA,
      oddsB,
      bettorCount,
    ] = data;

    const numOddsA = Number(oddsA);
    const numOddsB = Number(oddsB);
    const numTotalVolume = Number(totalVolume);

    return {
      question: question as string,
      optionA: optionA as string,
      optionB: optionB as string,
      endTime: Number(endTime),
      resolved: Boolean(resolved),
      volumeA: Number(volumeA),
      volumeB: Number(volumeB),
      totalVolume: numTotalVolume,
      oddsA: numOddsA,
      oddsB: numOddsB,
      bettorCount: Number(bettorCount),
      // Convert from basis points to percentage
      probabilityA: numTotalVolume > 0 ? basisPointsToPercentage(numOddsA) : 50,
      probabilityB: numTotalVolume > 0 ? basisPointsToPercentage(numOddsB) : 50,
      timeRemaining: Math.max(0, Number(endTime) - Date.now() / 1000),
    };
  }, [data, isError, marketId, formattedMarketId]);

  return {
    data: formattedDetails,
    isError,
    isLoading,
    refetch,
  };
}

// Hook to get Total Value Locked (TVL)
export function useTotalValueLocked() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.factory as Address,
    abi: FACTORY_ABI,
    functionName: "getTotalValueLocked",
    query: {
      enabled: !!CONTRACT_ADDRESSES.factory,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const formattedTVL = useMemo(() => {
    if (!data) return null;

    return {
      totalTVL: Number(data),
      // Convert to human readable format (assuming 6 decimals for USDC/USDT)
      formattedTVL: (Number(data) / 1e6).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    };
  }, [data]);

  return {
    data: formattedTVL,
    isError,
    isLoading,
    refetch,
  };
}

// Hook to get overall market statistics
export function useMarketStats() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.factory as Address,
    abi: FACTORY_ABI,
    functionName: "getMarketStats",
    query: {
      enabled: !!CONTRACT_ADDRESSES.factory,
      refetchInterval: 60000, // Refetch every minute
    },
  });

  const formattedStats = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    const [totalMarkets, totalTVL, activeMarkets, totalBets, totalBettors] =
      data;

    return {
      totalMarkets: Number(totalMarkets),
      totalTVL: Number(totalTVL),
      activeMarkets: Number(activeMarkets),
      totalBets: Number(totalBets),
      totalBettors: Number(totalBettors),
      // Formatted versions
      formattedTVL: (Number(totalTVL) / 1e6).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      averageTVLPerMarket:
        Number(totalMarkets) > 0 ? Number(totalTVL) / Number(totalMarkets) : 0,
    };
  }, [data]);

  return {
    data: formattedStats,
    isError,
    isLoading,
    refetch,
  };
}

// Hook to get multiple market data at once (useful for market lists)
export function useMultipleMarketOdds(marketIds: string[]) {
  const contracts = useMemo(() => {
    const validContracts: Array<{
      address: Address;
      abi: Abi;
      functionName: string;
      args: [`0x${string}`];
    }> = [];

    marketIds.forEach((marketId) => {
      try {
        const formattedMarketId = isValidMarketId(marketId) ? marketIdToBytes32(marketId) : null;
        if (!formattedMarketId) {
          console.error("Invalid marketId for multiple odds:", marketId);
          return;
        }
        validContracts.push({
          address: CONTRACT_ADDRESSES.factory as Address,
          abi: FACTORY_ABI as Abi,
          functionName: "getMarketOdds",
          args: [formattedMarketId],
        });
      } catch (error) {
        console.error("Error formatting marketId for multiple odds:", marketId, error);
      }
    });

    return validContracts;
  }, [marketIds]);

  const { data, isError, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: marketIds.length > 0 && !!CONTRACT_ADDRESSES.factory,
      refetchInterval: 15000,
    },
  });

  const formattedData = useMemo(() => {
    if (!data) return [];

    return data.map((result, index) => {
      if (result.status !== "success" || !result.result) {
        return {
          marketId: marketIds[index],
          error: true,
          oddsA: 0,
          oddsB: 0,
          totalVolume: 0,
          probabilityA: 50,
          probabilityB: 50,
        };
      }

      const [oddsA, oddsB, totalVolume] = result.result as [
        bigint,
        bigint,
        bigint
      ];

      return {
        marketId: marketIds[index],
        error: false,
        oddsA: Number(oddsA),
        oddsB: Number(oddsB),
        totalVolume: Number(totalVolume),
        // Convert fro basis points to percentage
        probabilityA: Number(totalVolume) > 0 ? basisPointsToPercentage(Number(oddsA)) : 50,
        probabilityB: Number(totalVolume) > 0 ? basisPointsToPercentage(Number(oddsB)) : 50,
      };
    });
  }, [data, marketIds]);

  return {
    data: formattedData,
    isError,
    isLoading,
    refetch,
  };
}

// Utility hook to check if a market exists
export function useMarketExists(marketId: string | null) {
  const formattedMarketId = useMemo(() => {
    if (!marketId || !isValidMarketId(marketId)) return undefined;
    try {
      return marketIdToBytes32(marketId);
    } catch (error) {
      console.error("Error converting marketId to bytes32:", error, "marketId:", marketId);
      return undefined;
    }
  }, [marketId]);

  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.factory as Address,
    abi: FACTORY_ABI,
    functionName: "marketExists",
    args: formattedMarketId ? [formattedMarketId] : undefined,
    query: {
      enabled: !!formattedMarketId && !!CONTRACT_ADDRESSES.factory,
    },
  });

  return {
    exists: Boolean(data),
    isError,
    isLoading,
  };
}
