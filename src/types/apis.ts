

export interface User {
  id: number;
  username: string;
  about: string;
  wallet_address: string;
  role: 'USER' | 'ADMIN'; // Add more roles as needed
  profile_pic: string | null;
  createdAt: string; // Consider Date if parsing
  updatedAt: string;
};



export interface Creator {
  id: number;
  username: string;
  wallet_address: string;
}

export interface Market {
  id: number;
  description: string;
  resolution_criteria: string;
  question: string;
  expiry_date: string;
  marketId: string; 
  image: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  creatorId: number;
  creator: Creator;
}

export interface MarketListResponse {
  meta: {
    total: number;
    page: number;
    size: number;
    totalPage: number;
  };
  data: Market[];
}
