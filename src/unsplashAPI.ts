// Official Unsplash API Integration (Working Alternative to Deprecated Source API)

export interface UnsplashAPIConfig {
  accessKey?: string; // Get from https://unsplash.com/developers
  fallbackToPlaceholders: boolean; // Use Lorem Picsum if no API key
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
    raw: string;
  };
  user: {
    name: string;
    username: string;
  };
}

export class UnsplashAPI {
  private config: UnsplashAPIConfig;
  private baseURL = 'https://api.unsplash.com';

  constructor(config: UnsplashAPIConfig = { fallbackToPlaceholders: true }) {
    this.config = config;
  }

  // Get random photo by category using the official API
  async getRandomPhoto(query?: string): Promise<string> {
    if (!this.config.accessKey) {
      // Fallback to Lorem Picsum (high-quality placeholder images)
      return this.getPlaceholderImage();
    }

    try {
      const params = new URLSearchParams({
        client_id: this.config.accessKey
      });

      if (query) {
        params.set('query', query);
      }

      const response = await fetch(`${this.baseURL}/photos/random?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const photo: UnsplashPhoto = await response.json();
      return photo.urls.regular;
    } catch (error) {
      console.warn('Unsplash API failed, falling back to placeholder:', error);
      return this.getPlaceholderImage();
    }
  }

  // Fallback to Lorem Picsum (high-quality placeholder images)
  private getPlaceholderImage(): string {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/400/300?random=${randomId}`;
  }

  // Search photos by keyword
  async searchPhotos(query: string, perPage: number = 1): Promise<string[]> {
    if (!this.config.accessKey) {
      // Return multiple placeholder images
      return Array.from({ length: perPage }, () => this.getPlaceholderImage());
    }

    try {
      const params = new URLSearchParams({
        client_id: this.config.accessKey,
        query: query,
        per_page: perPage.toString()
      });

      const response = await fetch(`${this.baseURL}/search/photos?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((photo: UnsplashPhoto) => photo.urls.regular);
    } catch (error) {
      console.warn('Unsplash search failed, falling back to placeholders:', error);
      return Array.from({ length: perPage }, () => this.getPlaceholderImage());
    }
  }
}

// Pre-configured generators for different categories
export function createUnsplashGenerators(api: UnsplashAPI) {
  return {
    nature: () => api.getRandomPhoto('nature landscape'),
    people: () => api.getRandomPhoto('people portrait'),
    business: () => api.getRandomPhoto('business office'),
    food: () => api.getRandomPhoto('food cooking'),
    travel: () => api.getRandomPhoto('travel vacation'),
    technology: () => api.getRandomPhoto('technology computer'),
    architecture: () => api.getRandomPhoto('architecture building'),
    abstract: () => api.getRandomPhoto('abstract pattern'),
    random: () => api.getRandomPhoto(), // No specific category
  };
}

// Simple function to get working image URL without API key
export function getWorkingImageURL(category?: string): string {
  const randomId = Math.floor(Math.random() * 1000);
  // Use Lorem Picsum which is reliable and high-quality
  return `https://picsum.photos/400/300?random=${randomId}`;
} 