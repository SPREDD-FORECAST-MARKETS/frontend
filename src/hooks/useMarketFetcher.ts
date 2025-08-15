import { useEffect, useRef, useCallback } from "react";
import { atom, useAtom } from "jotai";
import { listMarketAtom } from "../atoms/global";
import type { Market } from "../lib/interface";
import { fetchMarkets } from "../apis/market";


const marketLoadingAtom = atom<boolean>(false);

const initialFetchedTags: { current: Map<string | undefined, boolean> } = {
  current: new Map(),
};

export function useMarketFetcher(marketFilterTag: string | undefined) {
  const [markets, setMarkets] = useAtom<Market[]>(listMarketAtom);
  const [isLoading, setIsLoading] = useAtom(marketLoadingAtom);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (showLoading: boolean) => {
      // cancel previous
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        if (showLoading) setIsLoading(true);

        let filteredTags: string[] | undefined = undefined;
        if (marketFilterTag !== undefined && marketFilterTag !== "Top") {
          filteredTags = [marketFilterTag];
        }

        const response = await fetchMarkets({
          tags: filteredTags
        });

        // Handle both response formats
        const marketsData = response.markets || response.data || response;
        setMarkets(Array.isArray(marketsData) ? marketsData : []);
        initialFetchedTags.current.set(marketFilterTag, true);
      } catch (err: any) {
        if (err.name === "AbortError") {
          // ignore
        } else {
          console.error("Error fetching markets:", err);
        }
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [marketFilterTag, setMarkets, setIsLoading]
  );

  useEffect(() => {
    const hasFetched = initialFetchedTags.current.get(marketFilterTag) ?? false;
    fetchData(!hasFetched); // show loading only if first time for this tag

    const intervalId = setInterval(() => {
      fetchData(false); // silent polling
    }, 20_000);

    return () => {
      clearInterval(intervalId);
      controllerRef.current?.abort();
    };
  }, [fetchData, marketFilterTag]);

  return { markets, isLoading };
}
