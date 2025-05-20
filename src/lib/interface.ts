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
  icon: string;
  options?: MarketOption[];
  volume: string;
  description: string;
  creatorName: string;
  createdAt: Date;
  closingAt: Date;
  timeframe?: string;
  chance?: string;
  buyOptions?: string[];
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