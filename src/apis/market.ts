import axios from 'axios';

export const createMarket = async (authToken: string, question: string, resolution_criteria: string, description: string, expiry_date: string, image: string) => {
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
