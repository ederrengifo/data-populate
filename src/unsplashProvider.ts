// Unsplash Integration for Figma Data Populator Plugin

export interface UnsplashConfig {
  accessKey?: string; // Optional: for full API access
  useSourceAPI: boolean; // Use source.unsplash.com (no key required)
  defaultSize: string; // e.g., "400x300"
}

export interface UnsplashSearchOptions {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  category?: string;
  color?: string;
  size?: string;
}

export class UnsplashProvider {
  private config: UnsplashConfig;

  constructor(config: UnsplashConfig = { useSourceAPI: true, defaultSize: "400x300" }) {
    this.config = config;
  }

  // Generate random image URL using Source API (no key required)
  generateSourceURL(options: UnsplashSearchOptions): string {
    const { query, size = this.config.defaultSize } = options;
    const randomSeed = Math.floor(Math.random() * 10000);
    
    if (query) {
      return `https://source.unsplash.com/${size}/?${encodeURIComponent(query)},${randomSeed}`;
    }
    
    return `https://source.unsplash.com/${size}/?${randomSeed}`;
  }

  // Generate API URL for official Unsplash API (requires key)
  generateAPIURL(endpoint: 'random' | 'search', options: UnsplashSearchOptions): string {
    if (!this.config.accessKey) {
      throw new Error('Unsplash Access Key required for API usage');
    }

    const baseURL = 'https://api.unsplash.com';
    const params = new URLSearchParams({
      client_id: this.config.accessKey
    });

    if (endpoint === 'random') {
      if (options.query) params.set('query', options.query);
      if (options.orientation) params.set('orientation', options.orientation);
      return `${baseURL}/photos/random?${params}`;
    }

    if (endpoint === 'search') {
      if (options.query) params.set('query', options.query);
      if (options.orientation) params.set('orientation', options.orientation);
      if (options.color) params.set('color', options.color);
      params.set('per_page', '30'); // Get multiple results for variety
      return `${baseURL}/search/photos?${params}`;
    }

    throw new Error('Invalid endpoint');
  }

  // Fetch image using Source API
  async fetchSourceImage(options: UnsplashSearchOptions): Promise<string> {
    return this.generateSourceURL(options);
  }

  // Fetch image using official API
  async fetchAPIImage(options: UnsplashSearchOptions): Promise<string> {
    try {
      const randomURL = this.generateAPIURL('random', options);
      const response = await fetch(randomURL);
      
      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.urls.regular; // or .small, .thumb, .full based on needs
    } catch (error) {
      console.error('Unsplash API fetch failed:', error);
      // Fallback to Source API
      return this.generateSourceURL(options);
    }
  }

  // Main method to get image URL
  async getImageURL(options: UnsplashSearchOptions): Promise<string> {
    if (this.config.useSourceAPI || !this.config.accessKey) {
      return this.fetchSourceImage(options);
    } else {
      return this.fetchAPIImage(options);
    }
  }
}

// Predefined categories for easier usage
export const UnsplashCategories = {
  NATURE: { query: 'nature,landscape,outdoors', category: 'nature' },
  PEOPLE: { query: 'people,portrait,person', category: 'people' },
  BUSINESS: { query: 'business,office,professional', category: 'business' },
  TECHNOLOGY: { query: 'technology,computer,digital', category: 'technology' },
  FOOD: { query: 'food,cooking,restaurant', category: 'food' },
  TRAVEL: { query: 'travel,vacation,destination', category: 'travel' },
  ABSTRACT: { query: 'abstract,pattern,design', category: 'abstract' },
  ARCHITECTURE: { query: 'architecture,building,modern', category: 'architecture' },
  SPORTS: { query: 'sports,fitness,athletic', category: 'sports' },
  ANIMALS: { query: 'animals,pets,wildlife', category: 'animals' }
} as const;

// Factory function for easy integration
export function createUnsplashDataTypes(provider: UnsplashProvider) {
  return Object.entries(UnsplashCategories).map(([key, options]) => ({
    id: `unsplash_${key.toLowerCase()}`,
    name: `${key.charAt(0) + key.slice(1).toLowerCase()} Photos (Unsplash)`,
    category: 'image' as const,
    generator: async () => await provider.getImageURL(options)
  }));
} 