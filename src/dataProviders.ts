import { getDataTypeById, DataType } from './fakerConfig';

export interface ExternalDataProvider {
  id: string;
  name: string;
  category: 'image' | 'text' | 'number';
  endpoint: string;
  transformer: (response: any) => string;
}

// External data providers for APIs
export const externalProviders: ExternalDataProvider[] = [
  {
    id: 'avatar_randomuser',
    name: 'Avatar (RandomUser)',
    category: 'image',
    endpoint: 'https://randomuser.me/api/',
    transformer: (response) => response.results[0].picture.large
  },
  {
    id: 'product_dummyjson',
    name: 'Product (DummyJSON)',
    category: 'text',
    endpoint: 'https://dummyjson.com/products',
    transformer: (response) => response.products[Math.floor(Math.random() * response.products.length)].title
  },
  {
    id: 'product_image_dummyjson',
    name: 'Product Image (DummyJSON)',
    category: 'image',
    endpoint: 'https://dummyjson.com/products',
    transformer: (response) => response.products[Math.floor(Math.random() * response.products.length)].thumbnail
  },
  // Unsplash API providers (requires API key in production)
  {
    id: 'unsplash_random',
    name: 'Unsplash Random',
    category: 'image',
    endpoint: 'https://api.unsplash.com/photos/random?client_id=YOUR_ACCESS_KEY',
    transformer: (response) => response.urls.regular
  },
  {
    id: 'unsplash_search_nature',
    name: 'Unsplash Nature',
    category: 'image',
    endpoint: 'https://api.unsplash.com/search/photos?query=nature&client_id=YOUR_ACCESS_KEY',
    transformer: (response) => response.results[Math.floor(Math.random() * response.results.length)]?.urls.regular
  }
];

// Generate data using faker or external APIs
export async function generateData(dataTypeId: string, count: number = 1): Promise<string[]> {
  const results: string[] = [];
  
  // Check if it's a local faker data type
  const localDataType = getDataTypeById(dataTypeId);
  if (localDataType) {
    for (let i = 0; i < count; i++) {
      results.push(String(localDataType.generator()));
    }
    return results;
  }
  
  // Check if it's an external data provider
  const externalProvider = externalProviders.find(provider => provider.id === dataTypeId);
  if (externalProvider) {
    try {
      for (let i = 0; i < count; i++) {
        const response = await fetch(externalProvider.endpoint);
        const data = await response.json();
        results.push(externalProvider.transformer(data));
      }
      return results;
    } catch (error) {
      console.error(`Error fetching data from ${externalProvider.name}:`, error);
      // Fallback to a default value
      return Array(count).fill('Error loading data');
    }
  }
  
  // Fallback
  return Array(count).fill('Unknown data type');
}

// Batch generate data for multiple data types
export async function batchGenerateData(
  mappings: Array<{ layerName: string; dataTypeId: string; count: number }>
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  
  for (const mapping of mappings) {
    results[mapping.layerName] = await generateData(mapping.dataTypeId, mapping.count);
  }
  
  return results;
}

// Load image data (for image URLs, we need to fetch and convert to Uint8Array)
export async function loadImageData(imageUrl: string): Promise<Uint8Array> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error loading image:', error);
    throw error;
  }
} 