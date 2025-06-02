import axios from 'axios';
import type { Market } from '../lib/interface';


export const createMarket = async (authToken: string, question: string, resolution_criteria: string, description: string, expiry_date: string | number, image: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/market/create-market`,
      {
        question,
        resolution_criteria,
        description,
        expiry_date,
        image
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    console.log('Market created:', response.data);
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