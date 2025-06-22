// Main plugin code for Figma Data Populator

interface LayerMapping {
  layerName: string;
  dataTypeId: string | null;
  count: number;
  layers: SceneNode[];
  layerType: 'TEXT' | 'MIXED' | 'OTHER'; // Add layer type information
}

interface PluginMessage {
  type: 'scan-layers' | 'apply-data' | 'remove-mapping' | 'get-data-types';
  data?: any;
}

// Store the current mappings
let layerMappings: LayerMapping[] = [];

// Configuration storage key for this file
const CONFIG_STORAGE_KEY = 'layerConfigurations';
const INTEGER_SETTINGS_KEY = 'integerSettings';

// Initialize plugin
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = async (msg: any) => {
  try {
    switch (msg.type) {
      case 'scan-layers':
        await scanSelectedLayers();
        break;
      
      case 'apply-data':
        await applyDataToLayers(msg.mappings);
        break;
      
      case 'remove-mapping':
        removeMappingByName(msg.layerName);
        break;
      
      case 'get-data-types':
        sendDataTypesToUI();
        break;
      
      case 'store-integer-settings':
        await storeIntegerSettings(msg.data);
        break;
      
      case 'load-integer-settings':
        await loadIntegerSettings();
        break;
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: `Plugin error: ${error}`
    });
  }
};

// Scan selected layers for % prefixes
async function scanSelectedLayers() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one layer'
    });
    return;
  }
  
  // Clear previous mappings
  layerMappings = [];
  
  // Find all layers with % prefix
  const foundLayers = new Map<string, SceneNode[]>();
  
  function traverseNode(node: SceneNode) {
    try {
      if (node.name && node.name.startsWith('%')) {
        const cleanName = node.name;
        if (!foundLayers.has(cleanName)) {
          foundLayers.set(cleanName, []);
        }
        foundLayers.get(cleanName)!.push(node);
      }
      
      // Traverse children if it's a container
      if ('children' in node && node.children) {
        for (const child of node.children) {
          traverseNode(child);
        }
      }
    } catch (error) {
      // Skip problematic nodes
    }
  }
  
  // Traverse all selected nodes
  try {
    for (const node of selection) {
      // Check if node is directly a layer with % prefix
      if (node.name && node.name.startsWith('%')) {
        const cleanName = node.name;
        if (!foundLayers.has(cleanName)) {
          foundLayers.set(cleanName, []);
        }
        foundLayers.get(cleanName)!.push(node);
      }
      
      // Also traverse children
      traverseNode(node);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Error scanning selected layers'
    });
    return;
  }
  
  // Convert to layer mappings
  for (const [layerName, layers] of foundLayers) {
    // Determine the predominant layer type
    const textLayers = layers.filter(layer => layer.type === 'TEXT');
    let layerType: 'TEXT' | 'MIXED' | 'OTHER';
    
    if (textLayers.length === layers.length) {
      // All layers are text
      layerType = 'TEXT';
    } else if (textLayers.length > 0) {
      // Mix of text and non-text layers
      layerType = 'MIXED';
    } else {
      // All layers are non-text
      layerType = 'OTHER';
    }
    
    layerMappings.push({
      layerName,
      dataTypeId: null,
      count: layers.length,
      layers,
      layerType
    });
  }
  
  // Load saved configurations and apply them
  const savedConfigs = await loadSavedConfigurations();
  
  // Apply saved configurations to mappings
  for (const layerMapping of layerMappings) {
    if (savedConfigs[layerMapping.layerName]) {
      layerMapping.dataTypeId = savedConfigs[layerMapping.layerName];
      console.log(`🔄 Applied saved config: ${layerMapping.layerName} → ${layerMapping.dataTypeId}`);
    }
  }

  // Send results to UI
  figma.ui.postMessage({
    type: 'layers-scanned',
    data: {
      mappings: layerMappings.map(mapping => ({
        layerName: mapping.layerName,
        dataTypeId: mapping.dataTypeId,
        count: mapping.count,
        layerType: mapping.layerType,
        isPreConfigured: !!savedConfigs[mapping.layerName]
      })),
      savedConfigurations: savedConfigs
    }
  });
}

// Remove a mapping
function removeMappingByName(layerName: string) {
  layerMappings = layerMappings.filter(mapping => mapping.layerName !== layerName);
  
  figma.ui.postMessage({
    type: 'mapping-removed',
    data: { layerName }
  });
}

// Apply data to layers
async function applyDataToLayers(mappings: Array<{ layerName: string; dataTypeId: string }>) {
  try {
    // Update layer mappings with selected data types
    for (const mapping of mappings) {
      const layerMapping = layerMappings.find(lm => lm.layerName === mapping.layerName);
      if (layerMapping) {
        layerMapping.dataTypeId = mapping.dataTypeId;
      }
    }
    
    // Generate data for each mapping
    const dataResults: Record<string, string[]> = {};
    
    for (const layerMapping of layerMappings) {
      if (layerMapping.dataTypeId) {
        const data = await generateDataForType(layerMapping.dataTypeId, layerMapping.count, layerMapping.layerName);
        dataResults[layerMapping.layerName] = data;
      }
    }
    
    // Apply data to layers
    for (const layerMapping of layerMappings) {
      if (layerMapping.dataTypeId && dataResults[layerMapping.layerName]) {
        const data = dataResults[layerMapping.layerName];
        
        for (let i = 0; i < layerMapping.layers.length; i++) {
          const layer = layerMapping.layers[i];
          const value = data[i] || data[0]; // Fallback to first value if not enough data
          
          await applyValueToLayer(layer, value, layerMapping.dataTypeId);
        }
      }
    }
    
    // Save configurations for future use
    for (const mapping of mappings) {
      await saveConfiguration(mapping.layerName, mapping.dataTypeId);
    }
    
    // Also save integer settings if any mappings use integers
    for (const mapping of mappings) {
      if (mapping.dataTypeId === 'integer') {
        figma.ui.postMessage({
          type: 'save-integer-settings',
          layerName: mapping.layerName
        });
      }
    }

    figma.ui.postMessage({
      type: 'data-applied',
      message: 'Data successfully applied to layers!'
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: `Error applying data: ${error}`
    });
  }
}

// Generate data for a specific type
async function generateDataForType(dataTypeId: string, count: number, layerName?: string): Promise<string[]> {
  // Send request to UI to generate data (UI has access to faker and fetch)
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).substring(7);
    
    // Store the resolver
    const messageHandler = (msg: any) => {
      if (msg.type === 'data-generated' && msg.requestId === requestId) {
        figma.ui.off('message', messageHandler);
        resolve(msg.data);
      }
    };
    
    figma.ui.on('message', messageHandler);
    
    figma.ui.postMessage({
      type: 'generate-data',
      requestId,
      dataTypeId,
      count,
      layerName
    });
  });
}

// Apply a value to a specific layer
async function applyValueToLayer(layer: SceneNode, value: string, dataTypeId: string) {
  try {
    // Handle text layers
    if (layer.type === 'TEXT') {
      await figma.loadFontAsync(layer.fontName as FontName);
      layer.characters = value;
      return;
    }
    
    // Handle image layers - check for layers that can have fills
    const canHaveFills = layer.type === 'RECTANGLE' || layer.type === 'ELLIPSE' || layer.type === 'POLYGON' || layer.type === 'STAR' || layer.type === 'VECTOR';
    
    // Improved image type detection - include more specific avatar types
    const isImageType = dataTypeId.includes('image') || 
                       dataTypeId.includes('avatar') || 
                       dataTypeId.includes('unsplash') ||
                       dataTypeId === 'avatar_randomuser' ||
                       dataTypeId === 'avatar_pravatar' ||
                       dataTypeId === 'avatar_multiavatar' ||
                       dataTypeId === 'avatar_robohash' ||
                       dataTypeId === 'avatar_dicebear' ||
                       dataTypeId === 'product_image';
    
    if (canHaveFills && isImageType) {
      console.log(`🖼️ Attempting to load image for ${dataTypeId}: ${value}`);
      
      // For images, we need to load the image data
      const imageData = await loadImageFromURL(value);
      if (imageData) {
        console.log(`✅ Successfully loaded image data, applying to layer`);
        const imageFill: ImagePaint = {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: figma.createImage(imageData).hash
        };
        (layer as any).fills = [imageFill];
        console.log(`✅ Image applied successfully to layer`);
      } else {
        console.warn(`❌ Failed to load image data, falling back to layer name`);
        // If image loading failed, set layer name instead
        layer.name = `Image failed: ${value}`;
      }
      return;
    }
    
    // For text data types on non-text layers, or as fallback
    if (!isImageType) {
      // Try to find child text layers
      if ('children' in layer) {
        for (const child of (layer as any).children) {
          if (child.type === 'TEXT') {
            await figma.loadFontAsync(child.fontName as FontName);
            child.characters = value;
            return;
          }
        }
      }
    }
    
    // For other layers, set the layer name
    layer.name = value;
    
  } catch (error) {
    console.error('Error in applyValueToLayer:', error);
    // Skip errors when applying values to layers, but try to set name as fallback
    try {
      layer.name = `${dataTypeId}: ${value}`;
    } catch (error) {
      // Even name setting failed, skip silently
    }
  }
}

// Load image from URL (delegate to UI)
async function loadImageFromURL(url: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`🔄 Requesting image load for: ${url} (requestId: ${requestId})`);
    
    // Set up timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn(`⏰ Image load timeout for: ${url}`);
      figma.ui.off('message', messageHandler);
      resolve(null);
    }, 10000); // 10 second timeout
    
    const messageHandler = (msg: any) => {
      if (msg.type === 'image-loaded' && msg.requestId === requestId) {
        clearTimeout(timeout);
        figma.ui.off('message', messageHandler);
        
        if (msg.data) {
          console.log(`✅ Image loaded successfully: ${url}`);
        } else {
          console.warn(`❌ Image loading failed: ${url}`);
        }
        
        resolve(msg.data);
      }
    };
    
    figma.ui.on('message', messageHandler);
    
    figma.ui.postMessage({
      type: 'load-image',
      requestId,
      url
    });
  });
}

// Load saved configurations for this file
async function loadSavedConfigurations(): Promise<Record<string, string>> {
  try {
    const savedConfigs = await figma.clientStorage.getAsync(CONFIG_STORAGE_KEY);
    return savedConfigs || {};
  } catch (error) {
    console.log('No saved configurations found or error loading:', error);
    return {};
  }
}

// Save configuration for a layer name
async function saveConfiguration(layerName: string, dataTypeId: string) {
  try {
    const currentConfigs = await loadSavedConfigurations();
    currentConfigs[layerName] = dataTypeId;
    await figma.clientStorage.setAsync(CONFIG_STORAGE_KEY, currentConfigs);
    console.log(`💾 Saved configuration: ${layerName} → ${dataTypeId}`);
  } catch (error) {
    console.error('Error saving configuration:', error);
  }
}

// Send available data types to UI
function sendDataTypesToUI() {
  figma.ui.postMessage({
    type: 'data-types',
    data: {
      // This will be populated by the UI which has access to the faker config
    }
  });
}

// Store integer settings
async function storeIntegerSettings(settings: Record<string, any>) {
  try {
    await figma.clientStorage.setAsync(INTEGER_SETTINGS_KEY, settings);
    console.log('💾 Integer settings stored successfully');
  } catch (error) {
    console.error('Error storing integer settings:', error);
  }
}

// Load integer settings and send to UI
async function loadIntegerSettings() {
  try {
    const settings = await figma.clientStorage.getAsync(INTEGER_SETTINGS_KEY);
    figma.ui.postMessage({
      type: 'integer-settings-loaded',
      data: settings || {}
    });
    console.log('📥 Integer settings loaded and sent to UI');
  } catch (error) {
    console.error('Error loading integer settings:', error);
    figma.ui.postMessage({
      type: 'integer-settings-loaded',
      data: {}
    });
  }
} 