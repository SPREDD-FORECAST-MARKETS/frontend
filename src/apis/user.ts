import axios from "axios"


export interface UserDashboardInfo {
  predictions: number;
  wins: number; // Note: This seems to be "wins" but keeping as per backend response
}

export const updateMe = async (username: string, about: string, profile_pic: string, authToken: string) => {

    try {

        const resp = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/user/update-me`,
            {
                username,
                about,
                profile_pic,
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            }
        );

        return [null, resp.status]

    } catch (error: any) {
        return [null, -1]
    }

}

/**
 * Get user dashboard information (requires authentication)
 * Returns user's predictions count and wins count
 */
export const fetchUserDashboardInfo = async (
  authToken: string
): Promise<[UserDashboardInfo | null, number]> => {
  try {
    const response = await axios.get<UserDashboardInfo>(
      `${import.meta.env.VITE_BACKEND_URL}/user/dashboard`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    console.log('User dashboard info fetched:', response.data);
    return [response.data, response.status];
  } catch (error: any) {
    console.error('Failed to fetch user dashboard info:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    if (error.response?.status === 403) {
      throw new Error('Insufficient permissions');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error while fetching dashboard info');
    }
    
    return [null, error.response?.status || -1];
  }
};
