import type { LucideProps } from "lucide-react";

export interface TrendingMarketsData {
  id: number;
  icon: string;
  title: string;
  value: string;
}

export interface LeaderBoardData {
  id: number;
  avatar: string;
  username: string;
  value: string;
}

export interface MarketOption {
  name: string;
  percentage: string;
}

export interface MarketCard {
  id: string;
  title: string;
  description: string;
  category?: string;
  creatorName: string;
  volume?: string;
  timeframe?: string;
  createdAt: string | Date;
  closingAt: string | Date;
  icon: string;
  buyOptions?: boolean;
  options?: string[];
  yesPercentage?: number;
  noPercentage?: number;

}

export interface TrendingTagsData {
  id: number;
  name: string;
  icon?:
    | string
    | {
        component: React.ForwardRefExoticComponent<
          Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
        >;
        size: number;
      }
    | null;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: string;
  type: "buy" | "sell" | "deposit" | "reward";
  status: "completed" | "pending";
}


export interface LeaderBoardTableData{

  id: number;
  name: string;
  avatar: string;
  points: number;
  accuracy: string;
  winStreak: number;
  reward: string;



}
type Outcome = {
  id: number;
  outcome_title: string;
};

type Creator = {
  id: number;
  username: string;
  wallet_address: string;
};

export type Market = {
  id: number;
  description: string;
  resolution_criteria: string;
  contract_address: string;
  question: string;
  expiry_date: string | Date; // ISO string format
  image: string;
  tags: string[];
  marketId: string;
  isResolved: boolean;
  status: "ACTIVE" | "RESOLVED" | "CANCELLED"; // expand as needed
  outcomeWonTitle:string,
  winningOutcome:string,
  outcomeWon: number | null;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
  outcome: Outcome[];
};

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TimeframeOption = '1H' | '6H' | '1D' | '1W' | '1M' | '6M';

export interface TradeState {
  activeTimeframe: TimeframeOption;
  quantity: number;
  isBuy: boolean;
  currentPrice: number;
  priceChange: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  chartData: ChartDataPoint[] | null;
}


export interface UpdateProfileData {
  username: string;
  profile_pic?: File;
  about: string;
  keepExistingImage: boolean;
}



export type MarketOutcome = 0 | 1 | 2;

export const MarketOutcomeValues = {
  UNRESOLVED: 0 as MarketOutcome,
  OPTION_A: 1 as MarketOutcome,
  OPTION_B: 2 as MarketOutcome,
};

export interface UseResolveMarketProps {
  marketData: Market;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseResolveMarketReturn {
  marketData: any;
  error: string | null;
  isProcessing: boolean;
  isResolving: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  resolveMarket: (outcome: MarketOutcome) => Promise<void>;
  resetState: () => void;
  isPending: () => boolean;
  hasMarketEnded: () => boolean;
  getMarketEndTime: () => number | null;
  receipt: any;
  transactionHash: string | null;
  contractMarketInfo: any;
  contractMarketId: any;
  isContractResolved: boolean;
}


export interface FormData {
  title: string;
  options: string[];
  resolutionCriteria: string;
  tags?: string[] | null;
  endDate: number | string;
  endTime: number | string;
  image?: File;
  description: string;
  initialLiquidity: string;
  createOnChain: boolean;
}