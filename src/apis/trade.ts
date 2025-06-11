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
