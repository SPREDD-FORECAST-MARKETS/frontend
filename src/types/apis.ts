

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
