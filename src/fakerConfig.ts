import { faker } from '@faker-js/faker';

export const fakerInstance = faker;

export interface DataTypeOptions {
  // Common options
  preview?: boolean;
  sorting?: 'random' | 'ascending' | 'descending' | 'a-z' | 'z-a' | 'recent' | 'oldest';
  
  // Number-specific
  min?: number;
  max?: number;
  decimals?: boolean;
  format?: boolean;
  prefix?: string;
  
  // Text-specific
  customPrefix?: string;
  customSuffix?: string;
  provider?: string;
  domain?: string;
  
  // Date-specific
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY/MM/DD' | 'year' | 'month' | 'weekday';
  
  // Finance-specific
  financeType?: 'credit-card' | 'account-number' | 'bitcoin' | 'iban';
  
  // Person-specific
  personType?: 'full-name' | 'first-name' | 'last-name' | 'username' | 'gender' | 'job-title' | 'password';
  
  // Phone-specific
  phoneFormat?: 'human' | 'national' | 'international';
  
  // Location-specific
  locationType?: 'city' | 'country' | 'full-address' | 'street-address' | 'zip-code' | 'country-code' | 'coordinates';
  
  // Title-specific
  titleType?: 'post-title' | 'company-name' | 'product-name' | 'food' | 'animal' | 'song-title' | 'music-artist' | 'random-word';
  
  // Long text-specific
  textCategory?: 'any' | 'technology' | 'biography' | 'history' | 'nature' | 'medicine';
  
  // Avatar-specific
  avatarType?: 'any' | 'real-people' | 'male' | 'female' | 'robots' | 'cartoon';
  
  // Image-specific
  imageCategory?: 'any' | 'products' | 'landscape' | 'illustration' | 'home' | 'abstract';
  
  // Color-specific
  colorType?: 'solid' | 'gradient';
}

export interface DataType {
  id: string;
  name: string;
  category: 'numbers' | 'text' | 'media';
  hasOptions: boolean;
  defaultOptions?: DataTypeOptions;
  generator: (options?: DataTypeOptions) => string | number;
}

// NUMBERS - For TEXT/MIXED layers
export const numberDataTypes: DataType[] = [
  {
    id: 'custom',
    name: 'Custom',
    category: 'numbers',
    hasOptions: true,
    defaultOptions: {
      min: 1,
      max: 1000,
      decimals: false,
      format: false,
      prefix: '',
      sorting: 'random'
    },
    generator: (options) => {
      const min = options?.min || 1;
      const max = options?.max || 1000;
      const decimals = options?.decimals || false;
      const format = options?.format || false;
      const prefix = options?.prefix || '';
      
      let value = Math.random() * (max - min) + min;
      
      if (!decimals) {
        value = Math.floor(value);
      } else {
        value = Math.round(value * 100) / 100;
      }
      
      let result = value.toString();
      
      if (format && value >= 1000) {
        result = value.toLocaleString();
      }
      
      if (decimals && !result.includes('.')) {
        result += '.00';
      }
      
      return prefix + result;
    }
  },
  {
    id: 'percentage',
    name: 'Percentage',
    category: 'numbers',
    hasOptions: true,
    defaultOptions: {
      decimals: false,
      sorting: 'random'
    },
    generator: (options) => {
      const decimals = options?.decimals || false;
      let value = Math.random() * 100;
      
      if (!decimals) {
        value = Math.floor(value);
      } else {
        value = Math.round(value * 100) / 100;
      }
      
      return value + '%';
    }
  },
  {
    id: 'phone',
    name: 'Phone',
    category: 'numbers',
    hasOptions: true,
    defaultOptions: {
      phoneFormat: 'human'
    },
    generator: (options) => {
      const format = options?.phoneFormat || 'human';
      
      switch (format) {
        case 'national':
          return faker.phone.number('###-###-####');
        case 'international':
          return faker.phone.number('+1-###-###-####');
        default: // human
          return faker.phone.number();
      }
    }
  },
  {
    id: 'date',
    name: 'Date',
    category: 'numbers',
    hasOptions: true,
    defaultOptions: {
      dateFormat: 'MM/DD/YYYY',
      sorting: 'random'
    },
    generator: (options) => {
      const format = options?.dateFormat || 'MM/DD/YYYY';
      const date = faker.date.anytime();
      
      switch (format) {
        case 'DD/MM/YYYY':
          return date.toLocaleDateString('en-GB');
        case 'YYYY/MM/DD':
          return date.toISOString().split('T')[0];
        case 'year':
          return date.getFullYear().toString();
        case 'month':
          return date.toLocaleDateString('en-US', { month: 'long' });
        case 'weekday':
          return date.toLocaleDateString('en-US', { weekday: 'long' });
        default: // MM/DD/YYYY
          return date.toLocaleDateString('en-US');
      }
    }
  },
  {
    id: 'finances',
    name: 'Finances',
    category: 'numbers',
    hasOptions: true,
    defaultOptions: {
      financeType: 'credit-card'
    },
    generator: (options) => {
      const type = options?.financeType || 'credit-card';
      
      switch (type) {
        case 'account-number':
          return faker.finance.accountNumber();
        case 'bitcoin':
          return faker.finance.bitcoinAddress();
        case 'iban':
          return faker.finance.iban();
        default: // credit-card
          return faker.finance.creditCardNumber();
      }
    }
  }
];

// TEXT - For TEXT/MIXED layers
export const textDataTypes: DataType[] = [
  {
    id: 'person',
    name: 'Person',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      personType: 'full-name',
      customPrefix: '',
      customSuffix: ''
    },
    generator: (options) => {
      const type = options?.personType || 'full-name';
      const prefix = options?.customPrefix || '';
      const suffix = options?.customSuffix || '';
      
      let result = '';
      
      switch (type) {
        case 'first-name':
          result = faker.person.firstName();
          break;
        case 'last-name':
          result = faker.person.lastName();
          break;
        case 'username':
          result = faker.internet.userName();
          break;
        case 'gender':
          result = faker.person.gender();
          break;
        case 'job-title':
          result = faker.person.jobTitle();
          break;
        case 'password':
          result = faker.internet.password();
          break;
        default: // full-name
          result = faker.person.fullName();
      }
      
      return prefix + result + suffix;
    }
  },
  {
    id: 'email',
    name: 'Email',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      provider: '',
      sorting: 'random'
    },
    generator: (options) => {
      const provider = options?.provider;
      
      if (provider) {
        return faker.internet.email({ provider });
      }
      
      return faker.internet.email();
    }
  },
  {
    id: 'website',
    name: 'Website',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      domain: '',
      sorting: 'random'
    },
    generator: (options) => {
      const domain = options?.domain;
      
      if (domain) {
        return faker.internet.url({ protocol: 'https' }) + domain;
      }
      
      return faker.internet.url();
    }
  },
  {
    id: 'location',
    name: 'Location',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      locationType: 'city',
      sorting: 'random'
    },
    generator: (options) => {
      const type = options?.locationType || 'city';
      
      switch (type) {
        case 'country':
          return faker.location.country();
        case 'full-address':
          return faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.state();
        case 'street-address':
          return faker.location.streetAddress();
        case 'zip-code':
          return faker.location.zipCode();
        case 'country-code':
          return faker.location.countryCode();
        case 'coordinates':
          return faker.location.latitude() + ', ' + faker.location.longitude();
        default: // city
          return faker.location.city();
      }
    }
  },
  {
    id: 'title',
    name: 'Title',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      titleType: 'post-title',
      sorting: 'random'
    },
    generator: (options) => {
      const type = options?.titleType || 'post-title';
      
      switch (type) {
        case 'company-name':
          return faker.company.name();
        case 'product-name':
          return faker.commerce.productName();
        case 'food':
          return faker.commerce.productName(); // Will use food-related products
        case 'animal':
          return faker.animal.type();
        case 'song-title':
          return faker.lorem.words(3);
        case 'music-artist':
          return faker.person.fullName();
        case 'random-word':
          return faker.lorem.word();
        default: // post-title
          return faker.lorem.sentence();
      }
    }
  },
  {
    id: 'long_text',
    name: 'Long text',
    category: 'text',
    hasOptions: true,
    defaultOptions: {
      textCategory: 'any'
    },
    generator: (options) => {
      const category = options?.textCategory || 'any';
      
      // Long text dictionary - will be loaded from external file in production
      const longTexts = {
        technology: [
          "Artificial intelligence has transformed the way we interact with technology, enabling machines to learn from data and make intelligent decisions.",
          "Cloud computing has fundamentally changed how businesses operate, providing scalable, on-demand access to computing resources.",
          "Cybersecurity remains one of the most critical challenges in our digital age, as cyber threats continue to evolve in sophistication."
        ],
        biography: [
          "Born in a small coastal town, Maria discovered her passion for marine biology at the age of eight when she found her first sea turtle nest.",
          "Growing up in the bustling streets of Mumbai, Raj learned the value of hard work and perseverance from his grandmother.",
          "Sarah's journey from a shy, introverted child to a renowned public speaker began with a single act of courage."
        ],
        history: [
          "The fall of the Berlin Wall in 1989 marked not just the end of a physical barrier, but the symbolic collapse of the ideological divide.",
          "The Industrial Revolution of the 18th and 19th centuries fundamentally transformed human society.",
          "The ancient Silk Road was more than just a trade route; it was a cultural highway that connected civilizations."
        ],
        nature: [
          "Deep within the Amazon rainforest, an intricate ecosystem thrives in a delicate balance that has remained largely unchanged for millions of years.",
          "The migration of monarch butterflies represents one of nature's most remarkable journeys.",
          "Coral reefs, often called the rainforests of the sea, support approximately 25% of all marine species."
        ],
        medicine: [
          "The development of vaccines represents one of medicine's greatest triumphs, saving millions of lives.",
          "Gene therapy holds tremendous promise for treating previously incurable genetic disorders.",
          "The discovery of antibiotics fundamentally changed the practice of medicine."
        ]
      };
      
      if (category === 'any') {
        // Exclude post_titles from "any category" - they should only be used for Title > Post title
        const longTextCategories = ['technology', 'biography', 'history', 'nature', 'medicine'];
        const allTexts: string[] = [];
        longTextCategories.forEach(cat => {
          if (longTexts[cat as keyof typeof longTexts]) {
            allTexts.push(...longTexts[cat as keyof typeof longTexts]);
          }
        });
        return allTexts[Math.floor(Math.random() * allTexts.length)];
      }
      
      const categoryTexts = longTexts[category as keyof typeof longTexts];
      if (categoryTexts) {
        return categoryTexts[Math.floor(Math.random() * categoryTexts.length)];
      }
      
      return faker.lorem.paragraphs(2);
    }
  }
];

// MEDIA - For OTHER/MIXED layers
export const mediaDataTypes: DataType[] = [
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'media',
    hasOptions: true,
    defaultOptions: {
      avatarType: 'any'
    },
    generator: (options) => {
      const type = options?.avatarType || 'any';
      
      // Will integrate with existing CORS proxy system
      switch (type) {
        case 'real-people':
          return 'https://randomuser.me/api/portraits/men/1.jpg'; // Will use CORS proxy
        case 'male':
          return 'https://randomuser.me/api/portraits/men/1.jpg'; // Will use CORS proxy
        case 'female':
          return 'https://randomuser.me/api/portraits/women/1.jpg'; // Will use CORS proxy
        case 'robots':
          return `https://robohash.org/${faker.string.uuid()}?set=set1`;
        case 'cartoon':
          return `https://api.dicebear.com/7.x/avataaars/png?seed=${faker.string.uuid()}&size=200`;
                 default: // any
           const types: ('real-people' | 'robots' | 'cartoon')[] = ['real-people', 'robots', 'cartoon'];
           const randomType = types[Math.floor(Math.random() * types.length)];
           return mediaDataTypes[0].generator({ avatarType: randomType });
      }
    }
  },
  {
    id: 'image',
    name: 'Image',
    category: 'media',
    hasOptions: true,
    defaultOptions: {
      imageCategory: 'any'
    },
    generator: (options) => {
      const category = options?.imageCategory || 'any';
      
      // Will be implemented with Pixabay integration in UI
      // This is just the fallback for direct generator usage
      switch (category) {
        case 'products':
        case 'landscape':
        case 'illustration':
        case 'home':
        case 'abstract':
        default: // any
          return `https://picsum.photos/400/300?random=${faker.number.int({ min: 1, max: 1000 })}`;
      }
    }
  },
  {
    id: 'color',
    name: 'Color',
    category: 'media',
    hasOptions: true,
    defaultOptions: {
      colorType: 'solid'
    },
    generator: (options) => {
      const type = options?.colorType || 'solid';
      
      if (type === 'gradient') {
        const color1 = faker.color.rgb();
        const color2 = faker.color.rgb();
        return `linear-gradient(45deg, ${color1}, ${color2})`;
      }
      
      return faker.color.rgb();
    }
  }
];

// All data types combined
export const dataTypes: DataType[] = [
  ...numberDataTypes,
  ...textDataTypes,
  ...mediaDataTypes
];

export const getDataTypesByCategory = () => {
  return {
    numbers: numberDataTypes,
    text: textDataTypes,
    media: mediaDataTypes
  };
};

export const getDataTypesForLayerType = (layerType: 'TEXT' | 'MIXED' | 'OTHER') => {
  if (layerType === 'TEXT' || layerType === 'MIXED') {
    return {
      numbers: numberDataTypes,
      text: textDataTypes
    };
  } else {
    return {
      media: mediaDataTypes
    };
  }
};

export const getDataTypeById = (id: string): DataType | undefined => {
  return dataTypes.find(dt => dt.id === id);
}; 