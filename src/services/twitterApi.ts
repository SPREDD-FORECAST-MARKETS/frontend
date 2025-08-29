interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
}

export class TwitterApiService {
  private backendUrl: string;
  
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }
  
  async validateUsername(username: string): Promise<{ 
    isValid: boolean; 
    user?: TwitterUser; 
    error?: string; 
  }> {
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    
    // Basic validation - check format
    if (!this.isValidUsernameFormat(cleanUsername)) {
      return {
        isValid: false,
        error: 'Invalid username format. Use letters, numbers, and underscores only.'
      };
    }
    
    try {
      const response = await fetch(`${this.backendUrl}/twitter/validate/${cleanUsername}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          error: errorData.error || 'Validation failed'
        };
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Twitter API validation error:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
  
  private isValidUsernameFormat(username: string): boolean {
    // Twitter username rules: 1-15 characters, letters/numbers/underscores only
    const regex = /^[a-zA-Z0-9_]{1,15}$/;
    return regex.test(username);
  }
}