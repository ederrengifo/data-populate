import { getDataTypeById, DataType, DataTypeOptions } from './fakerConfig';

export interface ExternalDataProvider {
  id: string;
  name: string;
  category: 'image' | 'text' | 'number';
  endpoint: string;
  transformer: (response: any) => string;
}

// External data providers for APIs (using CORS proxy)
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
  }
];

// Generate data using enhanced faker with configuration options
export async function generateData(dataTypeId: string, count: number = 1, options?: DataTypeOptions): Promise<string[]> {
  const results: string[] = [];
  
  // Check if it's a local faker data type
  const localDataType = getDataTypeById(dataTypeId);
  if (localDataType) {
    for (let i = 0; i < count; i++) {
      results.push(String(localDataType.generator(options)));
    }
    
    // Apply sorting if specified
    if (options?.sorting) {
      applySorting(results, options.sorting);
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

// Apply sorting to results array
function applySorting(results: string[], sortType: string): void {
  switch (sortType) {
    case 'ascending':
      results.sort((a, b) => {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        const numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
      break;
    case 'descending':
      results.sort((a, b) => {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        const numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA;
        }
        return b.localeCompare(a);
      });
      break;
    case 'a-z':
      results.sort((a, b) => a.localeCompare(b));
      break;
    case 'z-a':
      results.sort((a, b) => b.localeCompare(a));
      break;
    case 'recent':
      // For dates, sort by most recent first
      results.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });
      break;
    case 'oldest':
      // For dates, sort by oldest first
      results.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
        return 0;
      });
      break;
    case 'random':
    default:
      // Shuffle array for random order
      for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
      }
      break;
  }
}

// Batch generate data for multiple data types with options
export async function batchGenerateData(
  mappings: Array<{ layerName: string; dataTypeId: string; count: number; options?: DataTypeOptions }>
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  
  for (const mapping of mappings) {
    results[mapping.layerName] = await generateData(mapping.dataTypeId, mapping.count, mapping.options);
  }
  
  return results;
}

// Enhanced avatar generation with CORS proxy support
export async function generateAvatarWithProxy(avatarType: string, corsProxyUrl: string): Promise<string> {
  try {
    switch (avatarType) {
      case 'real-people':
      case 'any':
        const randomUserUrl = `${corsProxyUrl}https://randomuser.me/api/`;
        const response = await fetch(randomUserUrl);
        const data = await response.json();
        return data.results[0].picture.large;
        
      case 'male':
        const maleUrl = `${corsProxyUrl}https://randomuser.me/api/?gender=male`;
        const maleResponse = await fetch(maleUrl);
        const maleData = await maleResponse.json();
        return maleData.results[0].picture.large;
        
      case 'female':
        const femaleUrl = `${corsProxyUrl}https://randomuser.me/api/?gender=female`;
        const femaleResponse = await fetch(femaleUrl);
        const femaleData = await femaleResponse.json();
        return femaleData.results[0].picture.large;
        
      case 'robots':
        return `https://robohash.org/${Math.random().toString(36).substring(7)}?set=set1&size=200x200`;
        
      case 'cartoon':
      default:
        return `https://api.dicebear.com/7.x/avataaars/png?seed=${Math.random().toString(36).substring(7)}&size=200`;
    }
  } catch (error) {
    console.error('Error generating avatar:', error);
    // Fallback to DiceBear
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${Math.random().toString(36).substring(7)}&size=200`;
  }
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