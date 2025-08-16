import axios from 'axios';
import type { Market } from '../lib/interface';

// Types for User Markets API responses
export interface UserMarket {
  id: number;
  contract_address: string;
  description: string;
  question: string;
  expiry_date: string; // ISO date string
  createdAt: string; // ISO date string
  image: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  outcomeWon: number | null;
}

export interface UserMarketsQueryParams {
  page?: number;
  limit?: number;
}


export const createMarket = async (authToken: string, question: string, resolution_criteria: string, description: string, expiry_date: string | number, image: string,marketId:string, contract_address: string,tags?: string[] | null | undefined) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/market/create-market`,
      {
        question,
        resolution_criteria,
        description,
        expiry_date,
        contract_address,
        tags,
        image,
        marketId,
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    return [response.data, response.status];
  } catch (error: any) {
    console.error('Failed to create market:', error.response?.data || error.message);
    throw [null, -1];
  }
};



export const fetchMarkets = async ({
  tags,
  sortBy = 'desc',
  orderBy = 'createdAt',
  page = 1,
  size = 100,
}: {
  tags?: string[];
  sortBy?: string;
  orderBy?: string;
  page?: number;
  size?: number;
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/market/markets`,
    {
      tags,
      sortBy,
      orderBy,
      page,
      size,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );

  return response.data;
};


export const fetchMarket = async (marketId: string) => {

    const response = await axios.get<Market>(
    `${import.meta.env.VITE_BACKEND_URL}/market/${marketId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );

  return response.data
}


/**
 * Get markets created by a specific user with pagination
 */
export const fetchUserMarkets = async (
  walletAddress: string,
  params: UserMarketsQueryParams = {}
): Promise<[UserMarket[] | null, number]> => {
  try {
    const { page = 1, limit = 10 } = params;
    
    const response = await axios.get<UserMarket[]>(
      `${import.meta.env.VITE_BACKEND_URL}/market/user/${walletAddress}`,
      {
        params: {
          page: page.toString(),
          limit: limit.toString(),
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    console.log('User markets fetched:', response.data);
    return [response.data, response.status];
  } catch (error: any) {
    console.error('Failed to fetch user markets:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid wallet address or parameters');
    }
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching user markets');
    }
    
    return [null, error.response?.status || -1];
  }
};



export const resolveMarket = async (marketId:number,outcomeWon:string)=>{
  try{

    const response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/market/resolve-market`,
      {marketId,outcomeWon})

      return response.data;





  }catch(error:any){
    console.error('Failed to resolve market:', error.response?.data || error.message);
    throw [null, -1];
  }
}