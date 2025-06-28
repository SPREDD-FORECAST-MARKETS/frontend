import axios from 'axios';

export interface Trade {
  id: number;
  unique_id: string;
  order_type: 'BUY' | 'SELL';
  order_size: number;
  amount: number;
  afterPrice: number;
  marketID: number;
  outcomeId: number;
  userID: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenAllocation {
  id: number;
  amount: number;
  userId: number;
  outcomeId: number;
  createdAt: string;
  updatedAt: string;
}



// Types for Trade API responses
export interface TradeUser {
    id: number;
    username: string;
    wallet_address: string;
    profile_pic?: string;
}

export interface TradeMarket {
    id: number;
    question: string;
    contract_address: string;
    creator: TradeUser;
}

export interface TradeOutcome {
    id: number;
    outcome_title: string;
}

export interface TradeEntry {
    id: number;
    unique_id: string;
    order_type: 'BUY' | 'SELL';
    order_size: string;
    amount: string;
    afterPrice: string;
    createdAt: Date;
    updatedAt: Date;
    market?: TradeMarket;
    outcome?: TradeOutcome;
    user?: TradeUser;
}

export interface PaginatedTradeResponse {
    data: TradeEntry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface TradeStatistics {
    totalTrades: number;
    totalVolume: string;
    buyTrades: number;
    sellTrades: number;
    buyPercentage: number;
    sellPercentage: number;
}

export interface CreateTradeRequest {
    order_type: 'BUY' | 'SELL';
    order_size: string;
    amount: string;
    afterPrice: string;
    marketID: number;
    outcomeId: number;
}

export interface CreateAllocationRequest {
    amount: string;
    outcomeId: number;
}

export interface TradeQueryParams {
    userWalletAddress?: string;
    marketContractAddress?: string;
    orderType?: 'BUY' | 'SELL';
    sortOrder?: 'asc' | 'desc';
    sortBy?: 'createdAt' | 'amount' | 'order_size' | 'afterPrice';
    page?: number;
    limit?: number;
    startDate?: string; // ISO string
    endDate?: string; // ISO string
}


export const createTrade = async (
  authToken: string,
  {
    order_type,
    order_size,
    amount,
    afterPrice,
    marketID,
    outcomeId,
  }: {
    order_type: 'BUY' | 'SELL';
    order_size: number;
    amount: number;
    afterPrice: number;
    marketID: number;
    outcomeId: number;
  }
): Promise<[Trade, number]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/trade/create`,
      {
        order_type,
        order_size,
        amount,
        afterPrice,
        marketID,
        outcomeId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    console.error('Failed to create trade:', error.response?.data || error.message);
    throw [null, -1];
  }
};

/**
 * Create or update a token allocation
 */
export const createOrUpdateTokenAllocation = async (
  authToken: string,
  {
    amount,
    outcomeId,
  }: {
    amount: number;
    outcomeId: number;
  }
): Promise<[TokenAllocation, number]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/trade/allocate`,
      {
        amount,
        outcomeId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    console.error('Failed to allocate tokens:', error.response?.data || error.message);
    throw [null, -1];
  }
};





// API Functions

/**
 * Get all trades with filtering and pagination
 */
export const fetchTrades = async (
    params: TradeQueryParams = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    try {
        const response = await axios.get<PaginatedTradeResponse>(
            `${import.meta.env.VITE_BACKEND_URL}/trade`,
            {
                params,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            }
        );

        console.log('Trades fetched:', response.data);
        return [response.data, response.status];
    } catch (error: any) {
        console.error('Failed to fetch trades:', error.response?.data || error.message);

        if (error.response?.status === 400) {
            throw new Error('Invalid query parameters');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error while fetching trades');
        }

        return [null, error.response?.status || -1];
    }
};

/**
 * Get trade by ID
 */
export const fetchTradeById = async (
    id: number
): Promise<[TradeEntry | null, number]> => {
    try {
        const response = await axios.get<TradeEntry>(
            `${import.meta.env.VITE_BACKEND_URL}/trade/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            }
        );

        console.log('Trade fetched:', response.data);
        return [response.data, response.status];
    } catch (error: any) {
        console.error('Failed to fetch trade:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            throw new Error('Trade not found');
        }
        if (error.response?.status === 400) {
            throw new Error('Invalid trade ID');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error while fetching trade');
        }

        return [null, error.response?.status || -1];
    }
};

/**
 * Get trade statistics
 */
export const fetchTradeStatistics = async (
    params: TradeQueryParams = {}
): Promise<[TradeStatistics | null, number]> => {
    try {
        const response = await axios.get<TradeStatistics>(
            `${import.meta.env.VITE_BACKEND_URL}/trade/statistics`,
            {
                params,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            }
        );

        console.log('Trade statistics fetched:', response.data);
        return [response.data, response.status];
    } catch (error: any) {
        console.error('Failed to fetch trade statistics:', error.response?.data || error.message);

        if (error.response?.status === 400) {
            throw new Error('Invalid query parameters');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error while fetching trade statistics');
        }

        return [null, error.response?.status || -1];
    }
};

/**
 * Create or update token allocation (requires authentication)
 */
export const createOrUpdateAllocation = async (
    allocationData: CreateAllocationRequest,
    authToken: string
): Promise<[any | null, number]> => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/trade/allocate`,
            allocationData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${authToken}`,
                },
            }
        );

        console.log('Allocation created/updated:', response.data);
        return [response.data, response.status];
    } catch (error: any) {
        console.error('Failed to create/update allocation:', error.response?.data || error.message);

        if (error.response?.status === 400) {
            throw new Error('Invalid allocation data');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication required');
        }
        if (error.response?.status === 403) {
            throw new Error('Insufficient permissions');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error while creating/updating allocation');
        }

        return [null, error.response?.status || -1];
    }
};

/**
 * Get trades by user wallet address
 */
export const fetchTradesByUser = async (
    walletAddress: string,
    params: Omit<TradeQueryParams, 'userWalletAddress'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        userWalletAddress: walletAddress,
    });
};

/**
 * Get trades by market contract address
 */
export const fetchTradesByMarket = async (
    contractAddress: string,
    params: Omit<TradeQueryParams, 'marketContractAddress'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        marketContractAddress: contractAddress,
    });
};

/**
 * Get buy trades only
 */
export const fetchBuyTrades = async (
    params: Omit<TradeQueryParams, 'orderType'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        orderType: 'BUY',
    });
};

/**
 * Get sell trades only
 */
export const fetchSellTrades = async (
    params: Omit<TradeQueryParams, 'orderType'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        orderType: 'SELL',
    });
};

/**
 * Get recent trades (sorted by creation date, descending)
 */
export const fetchRecentTrades = async (
    limit: number = 20,
    params: Omit<TradeQueryParams, 'sortBy' | 'sortOrder' | 'limit'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit,
    });
};

/**
 * Get trades within date range
 */
export const fetchTradesInDateRange = async (
    startDate: Date,
    endDate: Date,
    params: Omit<TradeQueryParams, 'startDate' | 'endDate'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    });
};

/**
 * Get top trades by volume (sorted by amount, descending)
 */
export const fetchTopTradesByVolume = async (
    limit: number = 20,
    params: Omit<TradeQueryParams, 'sortBy' | 'sortOrder' | 'limit'> = {}
): Promise<[PaginatedTradeResponse | null, number]> => {
    return fetchTrades({
        ...params,
        sortBy: 'amount',
        sortOrder: 'desc',
        limit,
    });
};

// Utility function to handle trade API errors consistently
export const handleTradeError = (error: any, operation: string) => {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    const statusCode = error.response?.status || -1;

    console.error(`Trade API Error - ${operation}:`, {
        message: errorMessage,
        status: statusCode,
        data: error.response?.data,
    });

    // Return user-friendly error messages
    switch (statusCode) {
        case 400:
            return 'Invalid request parameters';
        case 401:
            return 'Authentication required';
        case 403:
            return 'Insufficient permissions';
        case 404:
            return 'Trade not found';
        case 500:
            return 'Server error occurred';
        default:
            return 'Network error occurred';
    }
};
