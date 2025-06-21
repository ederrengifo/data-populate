// UI JavaScript for Figma Data Populator Plugin

// Import faker and data providers (in a real Figma plugin, you'd bundle these)
// For now, we'll include them directly in the HTML or use dynamic imports

let currentMappings = [];
let dataTypes = {};

// Initialize data types
const initializeDataTypes = () => {
    dataTypes = {
        text: [
            { id: 'name', name: 'Names' },
            { id: 'username', name: 'Usernames' },
            { id: 'city', name: 'Cities' },
            { id: 'country', name: 'Countries' },
            { id: 'post_title', name: 'Post Titles' },
            { id: 'description', name: 'Descriptions' },
            { id: 'lorem', name: 'Lorem Ipsum' },
            { id: 'product_name', name: 'Product Names' },
            { id: 'company', name: 'Company Names' },
            { id: 'email', name: 'Email Addresses' }
        ],
        number: [
            { id: 'integer', name: 'Integers' },
            { id: 'decimal', name: 'Decimals' },
            { id: 'currency', name: 'Currency' },
            { id: 'date', name: 'Dates' },
            { id: 'phone', name: 'Phone Numbers' },
            { id: 'percentage', name: 'Percentages' }
        ],
        image: [
            { id: 'avatar', name: 'Avatars' },
            { id: 'random_image', name: 'Random Images' },
            { id: 'product_image', name: 'Product Images' },
            { id: 'avatar_randomuser', name: 'Avatar (RandomUser)' },
            { id: 'product_image_dummyjson', name: 'Product Image (DummyJSON)' }
        ]
    };
};

// DOM elements
const scanButton = document.getElementById('scan-button');
const scanText = document.getElementById('scan-text');
const scanLoading = document.getElementById('scan-loading');
const mappingsContainer = document.getElementById('mappings-container');
const mappingsList = document.getElementById('mappings-list');
const emptyState = document.getElementById('empty-state');
const applySection = document.getElementById('apply-section');
const applyButton = document.getElementById('apply-button');
const applyText = document.getElementById('apply-text');
const applyLoading = document.getElementById('apply-loading');
const statusMessage = document.getElementById('status-message');

// Event listeners
scanButton.addEventListener('click', handleScanLayers);
applyButton.addEventListener('click', handleApplyData);

// Initialize
initializeDataTypes();

// Handle scan layers button click
function handleScanLayers() {
    setLoadingState(scanButton, scanText, scanLoading, true);
    hideStatusMessage();
    
    parent.postMessage({
        pluginMessage: {
            type: 'scan-layers'
        }
    }, '*');
}

// Handle apply data button click
function handleApplyData() {
    const mappings = [];
    
    // Collect all mappings with selected data types
    currentMappings.forEach(mapping => {
        const categorySelect = document.querySelector(`[data-layer="${mapping.layerName}"] .category-select`);
        const typeSelect = document.querySelector(`[data-layer="${mapping.layerName}"] .type-select`);
        
        if (categorySelect && typeSelect && typeSelect.value) {
            mappings.push({
                layerName: mapping.layerName,
                dataTypeId: typeSelect.value
            });
        }
    });
    
    if (mappings.length === 0) {
        showStatusMessage('Please assign data types to at least one layer mapping.', 'error');
        return;
    }
    
    setLoadingState(applyButton, applyText, applyLoading, true);
    hideStatusMessage();
    
    parent.postMessage({
        pluginMessage: {
            type: 'apply-data',
            data: { mappings }
        }
    }, '*');
}

// Handle remove mapping
function handleRemoveMapping(layerName) {
    parent.postMessage({
        pluginMessage: {
            type: 'remove-mapping',
            data: { layerName }
        }
    }, '*');
}

// Create mapping item HTML
function createMappingItem(mapping) {
    const item = document.createElement('div');
    item.className = 'mapping-item';
    item.setAttribute('data-layer', mapping.layerName);
    
    item.innerHTML = `
        <div class="mapping-header">
            <span class="layer-name">${mapping.layerName}</span>
            <div>
                <span class="layer-count">${mapping.count} layer${mapping.count > 1 ? 's' : ''}</span>
                <button class="remove-button" onclick="handleRemoveMapping('${mapping.layerName}')">Remove</button>
            </div>
        </div>
        <div class="data-type-selector">
            <select class="category-select" onchange="handleCategoryChange('${mapping.layerName}', this.value)">
                <option value="">Select Category</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="image">Image</option>
            </select>
            <select class="type-select" disabled>
                <option value="">Select Type</option>
            </select>
        </div>
    `;
    
    return item;
}

// Handle category selection change
function handleCategoryChange(layerName, category) {
    const typeSelect = document.querySelector(`[data-layer="${layerName}"] .type-select`);
    
    // Clear and populate type select
    typeSelect.innerHTML = '<option value="">Select Type</option>';
    
    if (category && dataTypes[category]) {
        typeSelect.disabled = false;
        dataTypes[category].forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            typeSelect.appendChild(option);
        });
    } else {
        typeSelect.disabled = true;
    }
    
    updateApplyButtonState();
}

// Update apply button state
function updateApplyButtonState() {
    const hasValidMappings = currentMappings.some(mapping => {
        const typeSelect = document.querySelector(`[data-layer="${mapping.layerName}"] .type-select`);
        return typeSelect && typeSelect.value;
    });
    
    applyButton.disabled = !hasValidMappings;
}

// Render mappings
function renderMappings(mappings) {
    currentMappings = mappings;
    mappingsList.innerHTML = '';
    
    if (mappings.length === 0) {
        emptyState.classList.remove('hidden');
        mappingsContainer.classList.add('hidden');
        applySection.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    mappingsContainer.classList.remove('hidden');
    applySection.classList.remove('hidden');
    
    mappings.forEach(mapping => {
        const item = createMappingItem(mapping);
        mappingsList.appendChild(item);
    });
    
    updateApplyButtonState();
}

// Set loading state for buttons
function setLoadingState(button, textEl, loadingEl, isLoading) {
    button.disabled = isLoading;
    textEl.classList.toggle('hidden', isLoading);
    loadingEl.classList.toggle('hidden', !isLoading);
}

// Show status message
function showStatusMessage(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.classList.remove('hidden');
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideStatusMessage();
        }, 3000);
    }
}

// Hide status message
function hideStatusMessage() {
    statusMessage.classList.add('hidden');
}

// Generate data using faker or external APIs
async function generateData(dataTypeId, count) {
    const results = [];
    
    // Simple faker-like data generation (in a real plugin, you'd use the actual faker library)
    const generators = {
        // Text types
        name: () => `${getRandomItem(['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emma'])} ${getRandomItem(['Smith', 'Johnson', 'Brown', 'Wilson', 'Davis'])}`,
        username: () => `user${Math.floor(Math.random() * 1000)}`,
        city: () => getRandomItem(['New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Berlin', 'Toronto', 'San Francisco']),
        country: () => getRandomItem(['United States', 'United Kingdom', 'France', 'Japan', 'Australia', 'Germany', 'Canada']),
        post_title: () => getRandomItem(['How to Build Amazing Products', 'The Future of Design', '10 Tips for Success', 'Getting Started with Code', 'Design Systems Guide']),
        description: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        lorem: () => getRandomItem(['lorem ipsum', 'dolor sit amet', 'consectetur adipiscing', 'elit sed do', 'eiusmod tempor']),
        product_name: () => getRandomItem(['Awesome Widget', 'Super Tool', 'Magic Device', 'Smart Gadget', 'Pro Equipment']),
        company: () => getRandomItem(['TechCorp', 'InnovateLabs', 'FutureSoft', 'DesignStudio', 'BuildCo']),
        email: () => `${getRandomItem(['john', 'jane', 'alex', 'sarah'])}@${getRandomItem(['example.com', 'test.org', 'demo.net'])}`,
        
        // Number types
        integer: () => Math.floor(Math.random() * 1000) + 1,
        decimal: () => (Math.random() * 100).toFixed(2),
        currency: () => `$${(Math.random() * 999 + 1).toFixed(2)}`,
        date: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        phone: () => `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        percentage: () => `${Math.floor(Math.random() * 100)}%`,
        
        // Image types
        avatar: () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`,
        random_image: () => `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
        product_image: () => `https://source.unsplash.com/400x300/?product,technology`
    };
    
    // External API generators
    if (dataTypeId === 'avatar_randomuser') {
        try {
            for (let i = 0; i < count; i++) {
                const response = await fetch('https://randomuser.me/api/');
                const data = await response.json();
                results.push(data.results[0].picture.large);
            }
            return results;
        } catch (error) {
            return Array(count).fill('https://api.dicebear.com/7.x/avataaars/svg?seed=fallback');
        }
    }
    
    if (dataTypeId === 'product_image_dummyjson') {
        try {
            const response = await fetch('https://dummyjson.com/products');
            const data = await response.json();
            for (let i = 0; i < count; i++) {
                const product = data.products[Math.floor(Math.random() * data.products.length)];
                results.push(product.thumbnail);
            }
            return results;
        } catch (error) {
            return Array(count).fill('https://picsum.photos/400/300?random=1');
        }
    }
    
    // Use local generators
    const generator = generators[dataTypeId];
    if (generator) {
        for (let i = 0; i < count; i++) {
            results.push(String(generator()));
        }
        return results;
    }
    
    return Array(count).fill('Unknown data type');
}

// Load image data
async function loadImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        return null;
    }
}

// Utility function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Listen for messages from the main plugin code
window.addEventListener('message', async (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;
    
    switch (msg.type) {
        case 'layers-scanned':
            setLoadingState(scanButton, scanText, scanLoading, false);
            renderMappings(msg.data.mappings);
            if (msg.data.mappings.length > 0) {
                showStatusMessage(`Found ${msg.data.mappings.length} layer mapping${msg.data.mappings.length > 1 ? 's' : ''}`);
            } else {
                showStatusMessage('No layers with % prefixes found in selection', 'error');
            }
            break;
            
        case 'mapping-removed':
            currentMappings = currentMappings.filter(m => m.layerName !== msg.data.layerName);
            renderMappings(currentMappings);
            showStatusMessage('Mapping removed');
            break;
            
        case 'data-applied':
            setLoadingState(applyButton, applyText, applyLoading, false);
            showStatusMessage(msg.message);
            break;
            
        case 'error':
            setLoadingState(scanButton, scanText, scanLoading, false);
            setLoadingState(applyButton, applyText, applyLoading, false);
            showStatusMessage(msg.message, 'error');
            break;
            
        case 'generate-data':
            // Generate data and send back to main code
            const data = await generateData(msg.dataTypeId, msg.count);
            parent.postMessage({
                pluginMessage: {
                    type: 'data-generated',
                    requestId: msg.requestId,
                    data: data
                }
            }, '*');
            break;
            
        case 'load-image':
            // Load image and send back to main code
            const imageData = await loadImageData(msg.url);
            parent.postMessage({
                pluginMessage: {
                    type: 'image-loaded',
                    requestId: msg.requestId,
                    data: imageData
                }
            }, '*');
            break;
    }
});

// Expose handleRemoveMapping to global scope for onclick handlers
window.handleRemoveMapping = handleRemoveMapping;
window.handleCategoryChange = handleCategoryChange; 