interface Creator {
  id: number;
  twitter_username: string;
  twitter_name: string;
  profile_image_url: string;
  position: number;
  joined_at: string;
}

export class CreatorsApiService {
  private backendUrl: string;
  
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }
  
  async joinCreators(twitter_username: string): Promise<{ 
    success: boolean; 
    creator?: Creator; 
    error?: string; 
  }> {
    try {
      const response = await fetch(`${this.backendUrl}/creators/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ twitter_username })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to join creators program'
        };
      }
      
      const creator = await response.json();
      return { success: true, creator };
      
    } catch (error) {
      console.error('Creators API join error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
  
  async getCreators(): Promise<{ 
    success: boolean; 
    creators?: Creator[]; 
    error?: string; 
  }> {
    try {
      const response = await fetch(`${this.backendUrl}/creators/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch creators list'
        };
      }
      
      const creators = await response.json();
      return { success: true, creators };
      
    } catch (error) {
      console.error('Creators API list error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  async getCreatorCount(): Promise<{ 
    success: boolean; 
    count?: number; 
    error?: string; 
  }> {
    try {
      const response = await fetch(`${this.backendUrl}/creators/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch creators count'
        };
      }
      
      const result = await response.json();
      return { success: true, count: result.count };
      
    } catch (error) {
      console.error('Creators API count error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
}