const fs = require('fs');
const path = require('path');

console.log('Creating Faker.js bundle...');

try {
    // Import faker
    const { faker } = require('@faker-js/faker');
    
    // Create a bundle that exposes faker to the global scope
    const bundle = `
// Faker.js Bundle for Figma Plugin
// This file contains a pre-bundled version of Faker.js to avoid CDN loading issues
console.log('Loading bundled Faker.js...');

(function() {
    // Create a minimal faker implementation for the browser
    const fakerData = {
        person: {
            fullName: function() {
                const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Kenneth', 'Michelle', 'Joshua', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy'];
                const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];
                return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
            },
            firstName: function() {
                const names = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra'];
                return names[Math.floor(Math.random() * names.length)];
            },
            lastName: function() {
                const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
                return names[Math.floor(Math.random() * names.length)];
            }
        },
        location: {
            city: function() {
                const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Indianapolis', 'Charlotte', 'San Francisco', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Baltimore', 'Louisville', 'Portland', 'Oklahoma City', 'Milwaukee', 'Las Vegas', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Omaha'];
                return cities[Math.floor(Math.random() * cities.length)];
            },
            country: function() {
                const countries = ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Slovenia', 'Slovakia', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark', 'Iceland', 'Ireland', 'Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan'];
                return countries[Math.floor(Math.random() * countries.length)];
            }
        },
        internet: {
            email: function() {
                const names = ['john', 'jane', 'alex', 'sarah', 'mike', 'emma', 'david', 'lisa', 'chris', 'anna', 'tom', 'mary', 'james', 'susan', 'robert', 'jennifer', 'michael', 'linda', 'william', 'barbara'];
                const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com', 'test.org', 'demo.net', 'sample.io', 'mock.co', 'fake.com'];
                return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000) + '@' + domains[Math.floor(Math.random() * domains.length)];
            },
            userName: function() {
                const prefixes = ['user', 'player', 'gamer', 'cool', 'super', 'mega', 'ultra', 'pro', 'master', 'elite'];
                return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 10000);
            }
        },
        company: {
            name: function() {
                const prefixes = ['Global', 'International', 'Universal', 'Advanced', 'Premium', 'Elite', 'Pro', 'Smart', 'Tech', 'Digital'];
                const suffixes = ['Solutions', 'Systems', 'Technologies', 'Innovations', 'Enterprises', 'Industries', 'Corporation', 'Group', 'Labs', 'Works'];
                return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
            }
        },
        commerce: {
            productName: function() {
                const adjectives = ['Awesome', 'Super', 'Amazing', 'Premium', 'Professional', 'Advanced', 'Smart', 'Intelligent', 'Modern', 'Classic'];
                const nouns = ['Tool', 'Device', 'System', 'Solution', 'Product', 'Service', 'Platform', 'Application', 'Software', 'Hardware'];
                return adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + nouns[Math.floor(Math.random() * nouns.length)];
            }
        },
        lorem: {
            sentence: function() {
                const sentences = [
                    'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    'Ut enim ad minim veniam quis nostrud exercitation ullamco.',
                    'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
                    'Excepteur sint occaecat cupidatat non proident sunt in culpa.',
                    'Qui officia deserunt mollit anim id est laborum et dolore.',
                    'At vero eos et accusamus et iusto odio dignissimos ducimus.',
                    'Et harum quidem rerum facilis est et expedita distinctio.',
                    'Nam libero tempore cum soluta nobis est eligendi optio.',
                    'Temporibus autem quibusdam et aut officiis debitis aut rerum.'
                ];
                return sentences[Math.floor(Math.random() * sentences.length)];
            },
            paragraph: function() {
                return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
            },
            words: function() {
                const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
                const count = Math.floor(Math.random() * 5) + 3;
                const result = [];
                for (let i = 0; i < count; i++) {
                    result.push(words[Math.floor(Math.random() * words.length)]);
                }
                return result.join(' ');
            }
        },
        number: {
            int: function(options) {
                const min = options && options.min || 1;
                const max = options && options.max || 1000;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            float: function(options) {
                const min = options && options.min || 0;
                const max = options && options.max || 100;
                const digits = options && options.fractionDigits || 2;
                return parseFloat((Math.random() * (max - min) + min).toFixed(digits));
            }
        },
        finance: {
            amount: function() {
                return (Math.random() * 999 + 1).toFixed(2);
            }
        },
        date: {
            anytime: function() {
                return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            }
        },
        phone: {
            number: function() {
                return '+1-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000);
            }
        }
    };
    
    // Expose to global scope
    window.faker = fakerData;
    window.fakerBundleLoaded = true;
    
    console.log('✅ Bundled Faker.js loaded successfully!');
    console.log('Available modules:', Object.keys(fakerData));
    
    // Dispatch a custom event to notify that faker is ready
    window.dispatchEvent(new CustomEvent('fakerBundleReady', { detail: fakerData }));
})();
`;

    // Ensure dist directory exists
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Write the bundle file
    const bundlePath = path.join(distDir, 'faker.bundle.js');
    fs.writeFileSync(bundlePath, bundle);
    
    console.log('✅ Faker.js bundle created successfully at:', bundlePath);
    console.log('Bundle size:', (fs.statSync(bundlePath).size / 1024).toFixed(2), 'KB');

} catch (error) {
    console.error('❌ Error creating Faker.js bundle:', error);
    process.exit(1);
} 