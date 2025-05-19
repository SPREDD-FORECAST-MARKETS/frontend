import type { LucideProps } from "lucide-react";

export interface TrendingMarketsData{

    id:number,
    icon:string,
    title:string,
    value:string
}

export interface LeaderBoardData{

    id:number,
    avatar:string,
    username:string,
    value:string
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
    timeframe?: string;
    chance?: string;
    buyOptions?: string[];
  }

export interface TrendingTagsData{
    id:number,
    name:string,
    icon:string | null |{ component: React.ComponentType<LucideProps>, size: number } ,
  
}