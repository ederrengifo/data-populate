// Main plugin code for Figma Datalink

// Import the longTexts data from TypeScript file
import { longTextsData } from './longTextsData';

interface LayerMapping {
  layerName: string;
  dataTypeId: string | null;
  count: number;
  layers: SceneNode[];
  layerType: 'TEXT' | 'MIXED' | 'OTHER'; // Add layer type information
}

interface PluginMessage {
  type: 'scan-layers' | 'apply-data' | 'remove-mapping' | 'get-data-types' | 'long-texts-loaded' | 'progress-update' | 'selection-changed' | 'save-detailed-config' | 'sync-google-sheet' | 'apply-sheet-data' | 'get-selection-state' | 'clear-sync-data' | 'remove-configuration' | 'validate-license' | 'get-license-status' | 'clear-license-data';
  data?: any;
}

// Store the current mappings
let layerMappings: LayerMapping[] = [];

// License Manager - Gumroad Integration
interface LicenseData {
  licenseKey: string | null;
  isValid: boolean;
  dailyUses: number;
  lastResetDate: string;
  validationAttempts: number;
  lastAttemptTime: number;
  remainingActivations: number;
}

interface GumroadResponse {
  success: boolean;
  purchase?: {
    sale_id: string;
    product_name: string;
    product_id: string;
    created_at: string;
    sale_timestamp: string;
    quantity: number;
    price: number;
    gumroad_fee: number;
    currency: string;
    refunded: boolean;
    disputed: boolean;
    chargebacked: boolean;
    sale_id_2: string;
    purchaser_id: string;
    subscription_id: string;
    cancelled: boolean;
    ended: boolean;
  };
  uses: number;
  message: string;
}

class LicenseManager {
  private static readonly PRODUCT_ID = 'dD3gy2LmzWw7GRsfcEJMsg==';
  private static readonly STORAGE_KEYS = {
    LICENSE_KEY: 'datalink-license-key',
    DAILY_USES: 'datalink-daily-uses',
    LAST_RESET_DATE: 'datalink-last-reset-date',
    VALIDATION_ATTEMPTS: 'datalink-validation-attempts',
    LAST_ATTEMPT_TIME: 'datalink-last-attempt-time',
    REMAINING_ACTIVATIONS: 'datalink-remaining-activations',
    IS_LICENSED: 'datalink-is-licensed'
  };
  
  private static readonly MAX_FREE_DAILY_USES = 15;
  private static readonly MAX_LICENSE_USES = 10;
  private static readonly MAX_VALIDATION_ATTEMPTS = 15;
  private static readonly RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
  private static readonly GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';

  private static instance: LicenseManager;
  private licenseData: LicenseData = {
    licenseKey: null,
    isValid: false,
    dailyUses: 0,
    lastResetDate: this.getTodayDateString(),
    validationAttempts: 0,
    lastAttemptTime: 0,
    remainingActivations: 0
  };

  private constructor() {
    this.loadLicenseData();
  }

  public static getInstance(): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager();
    }
    return LicenseManager.instance;
  }

  // Get today's date string in user's local timezone
  private getTodayDateString(): string {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  }

  // Check if daily usage should be reset
  private shouldResetDailyUsage(): boolean {
    const today = this.getTodayDateString();
    return this.licenseData.lastResetDate !== today;
  }

  // Reset daily usage if it's a new day
  private resetDailyUsageIfNeeded(): void {
    if (this.shouldResetDailyUsage()) {
      this.licenseData.dailyUses = 0;
      this.licenseData.lastResetDate = this.getTodayDateString();
      this.saveLicenseData();
    }
  }

  // Load license data from Figma storage
  private async loadLicenseData(): Promise<void> {
    try {
      const [
        licenseKey,
        dailyUses,
        lastResetDate,
        validationAttempts,
        lastAttemptTime,
        remainingActivations,
        isLicensed
      ] = await Promise.all([
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.LICENSE_KEY),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.DAILY_USES),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.LAST_RESET_DATE),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.VALIDATION_ATTEMPTS),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.LAST_ATTEMPT_TIME),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.REMAINING_ACTIVATIONS),
        figma.clientStorage.getAsync(LicenseManager.STORAGE_KEYS.IS_LICENSED)
      ]);

      this.licenseData = {
        licenseKey: licenseKey || null,
        isValid: isLicensed || false,
        dailyUses: dailyUses || 0,
        lastResetDate: lastResetDate || this.getTodayDateString(),
        validationAttempts: validationAttempts || 0,
        lastAttemptTime: lastAttemptTime || 0,
        remainingActivations: remainingActivations || 0
      };

      // Reset daily usage if it's a new day
      this.resetDailyUsageIfNeeded();
    } catch (error) {
      console.error('Failed to load license data:', error);
    }
  }

  // Save license data to Figma storage
  private async saveLicenseData(): Promise<void> {
    try {
      await Promise.all([
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.LICENSE_KEY, this.licenseData.licenseKey),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.DAILY_USES, this.licenseData.dailyUses),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.LAST_RESET_DATE, this.licenseData.lastResetDate),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.VALIDATION_ATTEMPTS, this.licenseData.validationAttempts),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.LAST_ATTEMPT_TIME, this.licenseData.lastAttemptTime),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.REMAINING_ACTIVATIONS, this.licenseData.remainingActivations),
        figma.clientStorage.setAsync(LicenseManager.STORAGE_KEYS.IS_LICENSED, this.licenseData.isValid)
      ]);
    } catch (error) {
      console.error('Failed to save license data:', error);
    }
  }

  // Check if user has a valid license
  public isLicenseValid(): boolean {
    this.resetDailyUsageIfNeeded();
    return this.licenseData.isValid;
  }

  // Get remaining free uses for today
  public getRemainingDailyUses(): number {
    this.resetDailyUsageIfNeeded();
    return Math.max(0, LicenseManager.MAX_FREE_DAILY_USES - this.licenseData.dailyUses);
  }

  // Check if user can use the feature (either has license or has remaining free uses)
  public canUseFeature(): boolean {
    if (this.isLicenseValid()) {
      return true;
    }
    return this.getRemainingDailyUses() > 0;
  }

  // Increment usage counter after feature use
  public async incrementUsage(): Promise<void> {
    if (!this.isLicenseValid()) {
      this.resetDailyUsageIfNeeded();
      this.licenseData.dailyUses++;
      await this.saveLicenseData();
    }
  }

  // Check if user can make a validation attempt (rate limiting)
  public canMakeValidationAttempt(): boolean {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.licenseData.lastAttemptTime;
    
    // Reset attempts if rate limit window has passed
    if (timeSinceLastAttempt >= LicenseManager.RATE_LIMIT_WINDOW) {
      this.licenseData.validationAttempts = 0;
    }
    
    return this.licenseData.validationAttempts < LicenseManager.MAX_VALIDATION_ATTEMPTS;
  }

  // Validate license key format (basic Gumroad format check)
  public static isValidLicenseKeyFormat(licenseKey: string): boolean {
    if (!licenseKey || typeof licenseKey !== 'string') {
      return false;
    }
    
    // Remove whitespace
    const cleanKey = licenseKey.trim();
    
    // Gumroad license keys format:
    // - 35 characters total (32 alphanumeric + 3 hyphens)
    // - Pattern: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX (8-8-8-8 format)
    // - Example: 6F0E4C97-B72A4E69-A11BF6C4-AF6517E7
    const gumroadPattern = /^[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/i;
    
    return cleanKey.length === 35 && gumroadPattern.test(cleanKey);
  }

  // Validate license with Gumroad API (delegates to UI thread)
  public async validateLicense(licenseKey: string): Promise<{ success: boolean; message: string }> {
    if (!licenseKey.trim()) {
      return { success: false, message: 'Please enter a license key' };
    }

    if (!LicenseManager.isValidLicenseKeyFormat(licenseKey)) {
      return { success: false, message: 'Invalid license key format. Please check and try again.' };
    }

    if (!this.canMakeValidationAttempt()) {
      return { 
        success: false, 
        message: 'Too many validation attempts. Please try again later.' 
      };
    }

    // Update rate limiting
    this.licenseData.validationAttempts++;
    this.licenseData.lastAttemptTime = Date.now();
    await this.saveLicenseData();

    try {
      const response = await this.verifyWithGumroadAPI(licenseKey);
      
      if (response.success && response.purchase) {
        // Check if purchase is valid (not refunded, disputed, etc.)
        if (response.purchase.refunded || response.purchase.disputed || response.purchase.chargebacked) {
          return { 
            success: false, 
            message: 'This license key is no longer valid due to a refund or dispute.' 
          };
        }

        // Check activation count
        if (response.uses >= LicenseManager.MAX_LICENSE_USES) {
          return { 
            success: false, 
            message: 'This license key has reached its maximum number of activations.' 
          };
        }

        // License is valid, save it
        this.licenseData.licenseKey = licenseKey;
        this.licenseData.isValid = true;
        this.licenseData.remainingActivations = LicenseManager.MAX_LICENSE_USES - response.uses;
        await this.saveLicenseData();

        return { 
          success: true, 
          message: 'License activated successfully!' 
        };
      } else {
        return { 
          success: false, 
          message: response.message || 'Invalid license key. Please check and try again.' 
        };
      }
    } catch (error) {
      console.error('License validation error:', error);
      return { 
        success: false, 
        message: 'Unable to validate license. Please check your internet connection and try again.' 
      };
    }
  }

  // Communicate with Gumroad API via UI thread (like existing image loading pattern)
  private async verifyWithGumroadAPI(licenseKey: string): Promise<GumroadResponse> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(7);
      
      // Store the resolver
      const messageHandler = (msg: any) => {
        if (msg.type === 'license-verified' && msg.requestId === requestId) {
          figma.ui.off('message', messageHandler);
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.data);
          }
        }
      };
      
      figma.ui.on('message', messageHandler);
      
      figma.ui.postMessage({
        type: 'verify-license',
        requestId,
        licenseKey,
        productId: LicenseManager.PRODUCT_ID
      });
    });
  }

  // Get license status for UI
  public getLicenseStatus(): {
    isLicensed: boolean;
    remainingUses: number;
    canUse: boolean;
    quotaMessage: string;
  } {
    const isLicensed = this.isLicenseValid();
    const remainingUses = this.getRemainingDailyUses();
    const canUse = this.canUseFeature();

    let quotaMessage = '';
    if (!isLicensed) {
      if (remainingUses > 0) {
        quotaMessage = `${remainingUses} requests left today. Get unlimited`;
      } else {
        quotaMessage = 'You ran out of requests today. Get unlimited';
      }
    }

    return {
      isLicensed,
      remainingUses,
      canUse,
      quotaMessage
    };
  }

  // Clear all license data (for testing)
  public async clearLicenseData(): Promise<void> {
    this.licenseData = {
      licenseKey: null,
      isValid: false,
      dailyUses: 0,
      lastResetDate: this.getTodayDateString(),
      validationAttempts: 0,
      lastAttemptTime: 0,
      remainingActivations: 0
    };

    try {
      await Promise.all([
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.LICENSE_KEY),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.DAILY_USES),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.LAST_RESET_DATE),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.VALIDATION_ATTEMPTS),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.LAST_ATTEMPT_TIME),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.REMAINING_ACTIVATIONS),
        figma.clientStorage.deleteAsync(LicenseManager.STORAGE_KEYS.IS_LICENSED)
      ]);
    } catch (error) {
      console.error('Failed to clear license data:', error);
    }
  }
}

// Initialize license manager
const licenseManager = LicenseManager.getInstance();

// Configuration storage keys for this file (now stored in document)
const CONFIG_STORAGE_KEY = 'layerConfigurations';
const DETAILED_CONFIG_STORAGE_KEY = 'detailedLayerConfigurations';
const INTEGER_SETTINGS_KEY = 'integerSettings';

// Google Sheets sync storage keys (document-specific via root.setPluginData)
const SHEETS_DATA_KEY = 'googleSheetsData';
const SHEETS_COLUMNS_KEY = 'googleSheetsColumns';
const SHEETS_MAPPINGS_KEY = 'googleSheetsMappings';
const SHEETS_URL_KEY = 'googleSheetsUrl';

// Initialize plugin with theme colors support
figma.showUI(__html__, { 
  width: 320, 
  height: 600,
  themeColors: true 
});

// Initialize plugin by loading saved sync data
async function initializePlugin() {
  // Load saved Google Sheets sync data
  const savedSyncData = await loadSyncDataFromStorage();
  if (savedSyncData.url && savedSyncData.data.length > 0) {
    sheetData = savedSyncData.data;
    sheetColumns = savedSyncData.columns;
    syncLayerMappings = savedSyncData.mappings;
    
    console.log('📋 Restored Google Sheets sync data:', {
      url: savedSyncData.url,
      dataRows: sheetData.length,
      columns: sheetColumns.length,
      mappings: syncLayerMappings.length
    });

    // Notify UI that we have existing sync data
    figma.ui.postMessage({
      type: 'sync-data-restored',
      data: {
        url: savedSyncData.url,
        layers: syncLayerMappings,
        columns: sheetColumns,
        dataPreview: sheetData.slice(0, 3)
      }
    });
  }

  // Send initial selection state
  sendSelectionState();
  
  // Send initial license status
  sendLicenseStatus();
}

// Send current selection state to UI
function sendSelectionState() {
  const hasSelection = figma.currentPage.selection.length > 0;
  figma.ui.postMessage({
    type: 'selection-state',
    hasSelection: hasSelection
  });
}

// Send current license status to UI
function sendLicenseStatus() {
  const status = licenseManager.getLicenseStatus();
  figma.ui.postMessage({
    type: 'license-status',
    data: status
  });
}

const initialHasSelection = figma.currentPage.selection.length > 0;
figma.ui.postMessage({
  type: 'selection-changed',
  hasSelection: initialHasSelection
});

// Initialize the plugin
initializePlugin();

// Listen for selection changes
figma.on('selectionchange', () => {
  const hasSelection = figma.currentPage.selection.length > 0;
  figma.ui.postMessage({
    type: 'selection-changed',
    hasSelection: hasSelection
  });
});

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
      
      case 'long-texts-loaded':
        // Handle long texts loaded message
        break;
      
      case 'save-detailed-config':
        console.log(`📨 Received save-detailed-config:`, msg.layerName, msg.dataTypeId, msg.config);
        await saveDetailedConfiguration(msg.layerName, msg.dataTypeId, msg.config);
        break;
      
      case 'sync-google-sheet':
        await syncGoogleSheet(msg.data.sheetUrl);
        break;
      
      case 'apply-sheet-data':
        await applySheetDataToLayers(msg.data.mappings);
        break;
      
      case 'get-selection-state':
        sendSelectionState();
        break;
      
      case 'clear-sync-data':
        await clearSyncDataFromStorage();
        sheetData = [];
        sheetColumns = [];
        syncLayerMappings = [];
        figma.ui.postMessage({
          type: 'sync-data-cleared',
          message: 'Google Sheets sync data cleared successfully'
        });
        break;
      
      case 'remove-configuration':
        await removeConfiguration(msg.layerName);
        break;
      
      case 'validate-license':
        await handleLicenseValidation(msg.data.licenseKey);
        break;
      
      case 'get-license-status':
        sendLicenseStatus();
        break;
      
      case 'clear-license-data':
        await licenseManager.clearLicenseData();
        sendLicenseStatus();
        figma.ui.postMessage({
          type: 'license-data-cleared',
          message: 'License data cleared for testing'
        });
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
  const detailedConfigs = await loadDetailedConfigurations();
  
  console.log(`📥 Loaded detailed configurations:`, detailedConfigs);
  
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
      savedConfigurations: savedConfigs,
      detailedConfigurations: detailedConfigs
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

// Handle license validation
async function handleLicenseValidation(licenseKey: string) {
  try {
    const result = await licenseManager.validateLicense(licenseKey);
    figma.ui.postMessage({
      type: 'license-validation-result',
      data: result
    });
    
    // Send updated license status after validation
    sendLicenseStatus();
  } catch (error) {
    figma.ui.postMessage({
      type: 'license-validation-result',
      data: {
        success: false,
        message: 'License validation failed. Please try again.'
      }
    });
  }
}

// Apply data to layers
async function applyDataToLayers(mappings: Array<{ layerName: string; dataTypeId: string }>) {
  // Check license before proceeding
  if (!licenseManager.canUseFeature()) {
    figma.ui.postMessage({
      type: 'feature-blocked',
      message: 'You have reached your daily limit. Please upgrade to continue.'
    });
    return;
  }

  try {
    // Update layer mappings with selected data types
    for (const mapping of mappings) {
      const layerMapping = layerMappings.find(lm => lm.layerName === mapping.layerName);
      if (layerMapping) {
        layerMapping.dataTypeId = mapping.dataTypeId;
      }
    }
    
    // Generate data for each mapping - only process mappings sent from UI
    const dataResults: Record<string, string[]> = {};
    
    for (const mapping of mappings) {
      const layerMapping = layerMappings.find(lm => lm.layerName === mapping.layerName);
      if (layerMapping && mapping.dataTypeId && typeof mapping.dataTypeId === 'string') {
        const data = await generateDataForType(mapping.dataTypeId, layerMapping.count, layerMapping.layerName);
        dataResults[layerMapping.layerName] = data;
      }
    }
    
    // Apply data to layers with progress tracking - only process mappings sent from UI
    let completedLayers = 0;
    const totalLayers = mappings
      .map(mapping => layerMappings.find(lm => lm.layerName === mapping.layerName))
      .filter(lm => lm && dataResults[lm.layerName])
      .reduce((sum, lm) => sum + lm!.layers.length, 0);
    
    for (const mapping of mappings) {
      const layerMapping = layerMappings.find(lm => lm.layerName === mapping.layerName);
      if (layerMapping && dataResults[layerMapping.layerName]) {
        const data = dataResults[layerMapping.layerName];
        
        for (let i = 0; i < layerMapping.layers.length; i++) {
          const layer = layerMapping.layers[i];
          const value = data[i] || data[0]; // Fallback to first value if not enough data
          
          await applyValueToLayer(layer, value, mapping.dataTypeId);
          
          // Send progress update after each individual layer
          completedLayers++;
          figma.ui.postMessage({
            type: 'progress-update',
            completed: completedLayers,
            total: totalLayers
          });
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

    // Increment usage count after successful application
    await licenseManager.incrementUsage();
    
    // Send updated license status
    sendLicenseStatus();

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
    
    // Handle color data types - apply colors as fills
    if (dataTypeId === 'color') {
      // Check for layers that can have fills - be more inclusive
      const canHaveFills = 'fills' in layer && layer.fills !== figma.mixed;
      
      if (canHaveFills) {
        console.log(`🎨 Applying color to layer: ${value}`);
        
        if (value.includes('linear-gradient')) {
          // Handle gradient fills
          const gradientMatch = value.match(/linear-gradient\(45deg,\s*rgb\((\d+),\s*(\d+),\s*(\d+)\),\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)\)/);
          if (gradientMatch) {
            const [, r1, g1, b1, r2, g2, b2] = gradientMatch;
            
            const gradientFill: GradientPaint = {
              type: 'GRADIENT_LINEAR',
              gradientTransform: [
                [1, 0, 0],
                [0, 1, 0]
              ],
              gradientStops: [
                {
                  position: 0,
                  color: { r: parseInt(r1) / 255, g: parseInt(g1) / 255, b: parseInt(b1) / 255, a: 1 }
                },
                {
                  position: 1,
                  color: { r: parseInt(r2) / 255, g: parseInt(g2) / 255, b: parseInt(b2) / 255, a: 1 }
                }
              ]
            };
            
            (layer as any).fills = [gradientFill];
            console.log(`✅ Gradient applied successfully to layer`);
          }
        } else if (value.includes('rgb(')) {
          // Handle solid color fills
          const colorMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (colorMatch) {
            const [, r, g, b] = colorMatch;
            
            const solidFill: SolidPaint = {
              type: 'SOLID',
              color: { r: parseInt(r) / 255, g: parseInt(g) / 255, b: parseInt(b) / 255 }
            };
            
            (layer as any).fills = [solidFill];
            console.log(`✅ Solid color applied successfully to layer`);
          }
        }
        
        // Don't change layer name for colors - just apply the fill
        return;
      } else {
        // For layers that can't have fills, don't change anything
        console.log(`⚠️ Layer ${layer.name} cannot have fills, skipping color application`);
        return;
      }
    }
    
    // Handle image layers - check for layers that can have fills
    const canHaveFills = 'fills' in layer && layer.fills !== figma.mixed;
    
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
    if (!isImageType && dataTypeId !== 'color') {
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

// Load saved configurations for this file (document-scoped)
async function loadSavedConfigurations(): Promise<Record<string, string>> {
  try {
    const savedConfigsStr = figma.root.getPluginData(CONFIG_STORAGE_KEY);
    if (savedConfigsStr) {
      return JSON.parse(savedConfigsStr);
    }
    return {};
  } catch (error) {
    console.log('No saved configurations found or error loading:', error);
    return {};
  }
}

// Load detailed configurations (including sub-settings) for this file (document-scoped)
async function loadDetailedConfigurations(): Promise<Record<string, any>> {
  try {
    const savedConfigsStr = figma.root.getPluginData(DETAILED_CONFIG_STORAGE_KEY);
    if (savedConfigsStr) {
      return JSON.parse(savedConfigsStr);
    }
    return {};
  } catch (error) {
    console.log('No detailed configurations found or error loading:', error);
    return {};
  }
}

// Save configuration for a layer name (document-scoped)
async function saveConfiguration(layerName: string, dataTypeId: string) {
  try {
    const currentConfigs = await loadSavedConfigurations();
    currentConfigs[layerName] = dataTypeId;
    figma.root.setPluginData(CONFIG_STORAGE_KEY, JSON.stringify(currentConfigs));
    console.log(`💾 Saved configuration: ${layerName} → ${dataTypeId}`);
  } catch (error) {
    console.error('Error saving configuration:', error);
  }
}

// Remove configuration for a layer name (document-scoped)
async function removeConfiguration(layerName: string) {
  try {
    const currentConfigs = await loadSavedConfigurations();
    const detailedConfigs = await loadDetailedConfigurations();
    
    // Remove from both basic and detailed configurations
    delete currentConfigs[layerName];
    delete detailedConfigs[layerName];
    
    figma.root.setPluginData(CONFIG_STORAGE_KEY, JSON.stringify(currentConfigs));
    figma.root.setPluginData(DETAILED_CONFIG_STORAGE_KEY, JSON.stringify(detailedConfigs));
    console.log(`🗑️ Removed configuration for: ${layerName}`);
  } catch (error) {
    console.error('Error removing configuration:', error);
  }
}

// Save detailed configuration (including sub-settings) for a layer name (document-scoped)
async function saveDetailedConfiguration(layerName: string, dataTypeId: string, config: any) {
  try {
    const currentConfigs = await loadDetailedConfigurations();
    currentConfigs[layerName] = {
      dataTypeId: dataTypeId,
      config: config
    };
    figma.root.setPluginData(DETAILED_CONFIG_STORAGE_KEY, JSON.stringify(currentConfigs));
    console.log(`💾 Saved detailed configuration: ${layerName} → ${dataTypeId}`, config);
    console.log(`💾 All detailed configs now:`, currentConfigs);
    
    // Debug: Immediately verify what was saved
    const verifyConfigsStr = figma.root.getPluginData(DETAILED_CONFIG_STORAGE_KEY);
    const verifyConfigs = verifyConfigsStr ? JSON.parse(verifyConfigsStr) : {};
    console.log(`🔍 VERIFY: Storage immediately after save:`, verifyConfigs);
  } catch (error) {
    console.error('Error saving detailed configuration:', error);
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

// Store integer settings (document-scoped)
async function storeIntegerSettings(settings: Record<string, any>) {
  try {
    figma.root.setPluginData(INTEGER_SETTINGS_KEY, JSON.stringify(settings));
    console.log('💾 Integer settings stored successfully');
  } catch (error) {
    console.error('Error storing integer settings:', error);
  }
}

// Load integer settings and send to UI (document-scoped)
async function loadIntegerSettings() {
  try {
    const settingsStr = figma.root.getPluginData(INTEGER_SETTINGS_KEY);
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    figma.ui.postMessage({
      type: 'integer-settings-loaded',
      data: settings
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
  
  // Send longTexts data to UI when plugin starts
  function sendLongTextsData() {
  try {
    figma.ui.postMessage({
      type: 'long-texts-loaded',
      data: longTextsData
    });
    console.log('📤 LongTexts data sent to UI');
  } catch (error) {
    console.error('Failed to send longTexts data:', error);
    figma.ui.postMessage({
      type: 'long-texts-loaded',
      data: null
    });
  }
}

// Send data when plugin starts
sendLongTextsData();

// Google Sheets API integration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyAYD3uWGvGo0pxL6ACuPQEFg7JQrk__o14';

// Store sheet data and layer mappings for sync
let sheetData: any[] = [];
let sheetColumns: string[] = [];
let syncLayerMappings: LayerMapping[] = [];

// Save Google Sheets sync data to document storage (document-scoped)
async function saveSyncDataToStorage(url: string, data: any[], columns: string[], mappings: LayerMapping[]) {
  try {
    figma.root.setPluginData(SHEETS_URL_KEY, url);
    figma.root.setPluginData(SHEETS_DATA_KEY, JSON.stringify(data));
    figma.root.setPluginData(SHEETS_COLUMNS_KEY, JSON.stringify(columns));
    figma.root.setPluginData(SHEETS_MAPPINGS_KEY, JSON.stringify(mappings));
    console.log('💾 Google Sheets sync data saved to document storage');
  } catch (error) {
    console.error('❌ Error saving sync data to storage:', error);
  }
}

// Load Google Sheets sync data from document storage (document-scoped)
async function loadSyncDataFromStorage(): Promise<{url: string | null, data: any[], columns: string[], mappings: LayerMapping[]}> {
  try {
    const url = figma.root.getPluginData(SHEETS_URL_KEY) || null;
    const dataStr = figma.root.getPluginData(SHEETS_DATA_KEY);
    const columnsStr = figma.root.getPluginData(SHEETS_COLUMNS_KEY);
    const mappingsStr = figma.root.getPluginData(SHEETS_MAPPINGS_KEY);

    const data = dataStr ? JSON.parse(dataStr) : [];
    const columns = columnsStr ? JSON.parse(columnsStr) : [];
    const mappings = mappingsStr ? JSON.parse(mappingsStr) : [];

    console.log('📥 Google Sheets sync data loaded from document storage');
    return {
      url,
      data,
      columns,
      mappings
    };
  } catch (error) {
    console.error('❌ Error loading sync data from storage:', error);
    return { url: null, data: [], columns: [], mappings: [] };
  }
}

// Clear Google Sheets sync data from document storage (document-scoped)
async function clearSyncDataFromStorage() {
  try {
    figma.root.setPluginData(SHEETS_URL_KEY, '');
    figma.root.setPluginData(SHEETS_DATA_KEY, '');
    figma.root.setPluginData(SHEETS_COLUMNS_KEY, '');
    figma.root.setPluginData(SHEETS_MAPPINGS_KEY, '');
    console.log('🗑️ Google Sheets sync data cleared from document storage');
  } catch (error) {
    console.error('❌ Error clearing sync data from storage:', error);
  }
}

// Extract spreadsheet ID from Google Sheets URL
function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Sync with Google Sheet and scan layers
async function syncGoogleSheet(sheetUrl: string) {
  try {
    console.log('🔄 Starting Google Sheets sync...');
    
    // Extract spreadsheet ID from URL
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Invalid Google Sheets URL. Please check the URL and try again.'
      });
      return;
    }

    console.log('📊 Spreadsheet ID:', spreadsheetId);

    // Fetch data from Google Sheets API (via CORS proxy)
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${GOOGLE_SHEETS_API_KEY}`;
    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    console.log('🌐 Fetching sheet data via CORS proxy...');
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 Sheet data received:', data);

    if (!data.values || data.values.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No data found in the Google Sheet or sheet is empty.'
      });
      return;
    }

    // Parse sheet data
    const rows = data.values;
    sheetColumns = rows[0] || []; // First row as headers
    sheetData = rows.slice(1) || []; // Rest as data

    console.log('📋 Columns found:', sheetColumns);
    console.log('📊 Data rows:', sheetData.length);

    // Scan for layers with % prefix (similar to main scan function)
    await scanLayersForSync();

    // Save sync data to storage after successful sync
    await saveSyncDataToStorage(sheetUrl, sheetData, sheetColumns, syncLayerMappings);

  } catch (error) {
    console.error('❌ Google Sheets sync error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Failed to sync with Google Sheets: ${error}`
    });
  }
}

// Scan selected layers for % prefixes (sync version)
async function scanLayersForSync() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one layer'
    });
    return;
  }
  
  // Clear previous mappings
  syncLayerMappings = [];
  
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
      layerType = 'TEXT';
    } else if (textLayers.length > 0) {
      layerType = 'MIXED';
    } else {
      layerType = 'OTHER';
    }
    
    syncLayerMappings.push({
      layerName,
      dataTypeId: null, // Will be column name instead
      count: layers.length,
      layers,
      layerType
    });
  }

  console.log('📊 Found layers for sync:', syncLayerMappings.length);

  // Send results to UI
  figma.ui.postMessage({
    type: 'sheet-sync-complete',
    data: {
      layers: syncLayerMappings,
      columns: sheetColumns,
      dataPreview: sheetData.slice(0, 3) // Send first 3 rows as preview
    }
  });
}

// Apply sheet data to layers
async function applySheetDataToLayers(mappings: Array<{ layerName: string; columnName: string }>) {
  // Check license before proceeding
  if (!licenseManager.canUseFeature()) {
    figma.ui.postMessage({
      type: 'feature-blocked',
      message: 'You have reached your daily limit. Please upgrade to continue.'
    });
    return;
  }

  try {
    console.log('🎯 Applying sheet data to layers...');
    
    if (sheetData.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No sheet data available. Please sync with Google Sheets first.'
      });
      return;
    }

    for (const mapping of mappings) {
      const layerMapping = syncLayerMappings.find(lm => lm.layerName === mapping.layerName);
      
      if (!layerMapping || !mapping.columnName) {
        continue;
      }

      const columnIndex = sheetColumns.indexOf(mapping.columnName);
      if (columnIndex === -1) {
        console.warn(`Column "${mapping.columnName}" not found`);
        continue;
      }

      console.log(`🔄 Processing ${layerMapping.layerName} with column ${mapping.columnName}`);

      // Apply data to each layer instance
      for (let i = 0; i < layerMapping.layers.length; i++) {
        const layer = layerMapping.layers[i];
        const rowIndex = i % sheetData.length; // Cycle through data if more layers than rows
        const cellValue = sheetData[rowIndex][columnIndex] || '';
        
        await applyValueToLayer(layer, cellValue.toString(), 'sheet-data');
      }
    }

    // Increment usage count after successful application
    await licenseManager.incrementUsage();
    
    // Send updated license status
    sendLicenseStatus();

    console.log('✅ Sheet data applied successfully');
    figma.ui.postMessage({
      type: 'success',
      message: 'Google Sheets data applied successfully!'
    });

  } catch (error) {
    console.error('❌ Error applying sheet data:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Failed to apply sheet data: ${error}`
    });
  }
} 