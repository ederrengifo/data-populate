// UI Bundle - This file bundles Faker.js for use in the Figma plugin UI
import { faker } from '@faker-js/faker';

// Expose faker to the global scope
(window as any).faker = faker;
(window as any).fakerLoaded = true;

console.log('✅ Faker.js successfully bundled and loaded!');
console.log('Available Faker modules:', Object.keys(faker));
console.log('Sample data test:', faker.person.fullName());

// Emit an event to notify that Faker is ready
window.dispatchEvent(new CustomEvent('fakerReady', { 
    detail: { faker: faker }
})); 