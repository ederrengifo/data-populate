import { faker } from '@faker-js/faker';

export const fakerInstance = faker;

export interface DataType {
  id: string;
  name: string;
  category: 'text' | 'number' | 'image';
  generator: () => string | number;
}

export const dataTypes: DataType[] = [
  // Text types
  {
    id: 'name',
    name: 'Names',
    category: 'text',
    generator: () => faker.person.fullName()
  },
  {
    id: 'username',
    name: 'Usernames',
    category: 'text',
    generator: () => faker.internet.userName()
  },
  {
    id: 'city',
    name: 'Cities',
    category: 'text',
    generator: () => faker.location.city()
  },
  {
    id: 'country',
    name: 'Countries',
    category: 'text',
    generator: () => faker.location.country()
  },
  {
    id: 'post_title',
    name: 'Post Titles',
    category: 'text',
    generator: () => faker.lorem.sentence()
  },
  {
    id: 'description',
    name: 'Descriptions',
    category: 'text',
    generator: () => faker.lorem.paragraph()
  },
  {
    id: 'lorem',
    name: 'Lorem Ipsum',
    category: 'text',
    generator: () => faker.lorem.words()
  },
  {
    id: 'product_name',
    name: 'Product Names',
    category: 'text',
    generator: () => faker.commerce.productName()
  },
  {
    id: 'company',
    name: 'Company Names',
    category: 'text',
    generator: () => faker.company.name()
  },
  {
    id: 'email',
    name: 'Email Addresses',
    category: 'text',
    generator: () => faker.internet.email()
  },

  // Number types
  {
    id: 'integer',
    name: 'Integers',
    category: 'number',
    generator: () => faker.number.int({ min: 1, max: 1000 })
  },
  {
    id: 'decimal',
    name: 'Decimals',
    category: 'number',
    generator: () => faker.number.float({ min: 0, max: 100, fractionDigits: 2 })
  },
  {
    id: 'currency',
    name: 'Currency',
    category: 'number',
    generator: () => `$${faker.number.float({ min: 1, max: 999, fractionDigits: 2 })}`
  },
  {
    id: 'date',
    name: 'Dates',
    category: 'number',
    generator: () => faker.date.recent().toLocaleDateString()
  },
  {
    id: 'phone',
    name: 'Phone Numbers',
    category: 'number',
    generator: () => faker.phone.number()
  },
  {
    id: 'percentage',
    name: 'Percentages',
    category: 'number',
    generator: () => `${faker.number.int({ min: 0, max: 100 })}%`
  },

  // Image types (URLs)
  {
    id: 'avatar',
    name: 'Avatars',
    category: 'image',
    generator: () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`
  },
  {
    id: 'random_image',
    name: 'Random Images',
    category: 'image',
    generator: () => `https://picsum.photos/400/300?random=${faker.number.int({ min: 1, max: 1000 })}`
  },
  {
    id: 'product_image',
    name: 'Product Images',
    category: 'image',
    generator: () => `https://source.unsplash.com/400x300/?product,${faker.commerce.product()}`
  }
];

export const getDataTypesByCategory = () => {
  const categories = {
    text: dataTypes.filter(dt => dt.category === 'text'),
    number: dataTypes.filter(dt => dt.category === 'number'),
    image: dataTypes.filter(dt => dt.category === 'image')
  };
  return categories;
};

export const getDataTypeById = (id: string): DataType | undefined => {
  return dataTypes.find(dt => dt.id === id);
}; 