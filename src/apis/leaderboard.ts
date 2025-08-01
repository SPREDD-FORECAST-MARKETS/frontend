import axios from 'axios';

export interface LeaderboardEntry {
  id: number;
  userID: number;
  pointType: 'TRADER' | 'CREATOR';
  points: number;
  user: {
    id: number;
    username: string;
    wallet_address: string;
    profile_pic: string | null;
  };
}

export interface MostTradedMarket {
  id: number;
  question: string;
  expiry_date:string
  tradeCount: number;
  marketId:string;
  image: string;
  creator: {
    username: string;
    wallet_address: string;
  };
}

export interface MarketVolumeResponse {
  marketId: number;
  marketQuestion: string;
  totalVolume: string;
  totalTrades: number;
  buyVolume: string;
  sellVolume: string;
  buyTradesCount: number;
  sellTradesCount: number;
}

export interface DetailedMarketVolumeResponse {
  marketId: number;
  marketQuestion: string;
  totalVolume: string;
  totalTrades: number;
  outcomes: Array<{
    outcomeId: number;
    outcomeTitle: string;
    buyVolume: string;
    sellVolume: string;
    totalOutcomeVolume: string;
    tradesCount: number;
  }>;
}

export type PointType = 'TRADER' | 'CREATOR';

// API Functions

/**
 * Get leaderboard by point type
 */
export const fetchLeaderboard = async (
  pointType: PointType,
  limit: number = 10
): Promise<[LeaderboardEntry[] | null, number]> => {
  try {
    const response = await axios.get<LeaderboardEntry[]>(
      `${import.meta.env.VITE_BACKEND_URL}/dashboard/leaderboard`,
      {
        params: {
          pointType,
          limit,
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    
    if (error.response?.status === 400) {
      throw new Error('Invalid point type or parameters');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching leaderboard');
    }
    
    return [null, error.response?.status || -1];
  }
};

/**
 * Get most traded markets in last 24 hours
 */
export const fetchMostTradedMarkets = async (
  limit: number = 10
): Promise<[MostTradedMarket[] | null, number]> => {
  try {
    const response = await axios.get<MostTradedMarket[]>(
      `${import.meta.env.VITE_BACKEND_URL}/dashboard/most-traded`,
      {
        params: {
          limit,
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching most traded markets');
    }
    
    return [null, error.response?.status || -1];
  }
};

/**
 * Get total volume of a specific market
 */
export const fetchMarketVolume = async (
  marketId: number
): Promise<[MarketVolumeResponse | null, number]> => {
  try {
    const response = await axios.get<MarketVolumeResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/dashboard/${marketId}/volume`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    
    if (error.response?.status === 404) {
      throw new Error('Market not found');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid market ID');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching market volume');
    }
    
    return [null, error.response?.status || -1];
  }
};

/**
 * Get detailed volume breakdown by outcome for a specific market
 */
export const fetchDetailedMarketVolume = async (
  marketId: number
): Promise<[DetailedMarketVolumeResponse | null, number]> => {
  try {
    const response = await axios.get<DetailedMarketVolumeResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/dashboard/${marketId}/volume/detailed`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    
    if (error.response?.status === 404) {
      throw new Error('Market not found');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid market ID');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching detailed market volume');
    }
    
    return [null, error.response?.status || -1];
  }
};

// Utility function to handle API errors consistently
export const handleDashboardError = (error: any, operation: string) => {
  const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
  const statusCode = error.response?.status || -1;
  
  console.error(`Dashboard API Error - ${operation}:`, {
    message: errorMessage,
    status: statusCode,
    data: error.response?.data,
  });
  
  // Return user-friendly error messages
  switch (statusCode) {
    case 400:
      return 'Invalid request parameters';
    case 404:
      return 'Resource not found';
    case 500:
      return 'Server error occurred';
    default:
      return 'Network error occurred';
  }
};