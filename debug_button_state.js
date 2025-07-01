// Open the plugin and run this in the browser console to debug button states

console.log('=== BUTTON STATE DEBUG ===');

const generateButton = document.getElementById('apply-button');
const syncButton = document.getElementById('sync-apply-button');

console.log('Generate Button:');
console.log('- Disabled:', generateButton?.disabled);
console.log('- Computed styles:', getComputedStyle(generateButton));
console.log('- Inline styles:', generateButton?.style.cssText);

console.log('\nSync Button:');
console.log('- Disabled:', syncButton?.disabled);
console.log('- Computed styles:', getComputedStyle(syncButton));
console.log('- Inline styles:', syncButton?.style.cssText);

console.log('\nLicense Status:');
console.log('- licenseStatus:', window.licenseStatus || 'undefined');

console.log('\nContainer classes:');
console.log('- Generate container:', generateButton?.parentElement?.className);
console.log('- Sync container:', syncButton?.parentElement?.className);
