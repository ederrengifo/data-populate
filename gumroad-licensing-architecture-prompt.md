# Implementing Gumroad Licensing Architecture for Figma Plugin

Please implement a comprehensive licensing system for my Figma plugin with the following architecture and requirements:

## Core Architecture Components

### 1. LicenseManager Class
Create a central licensing management system with these capabilities:
- Gumroad API integration for license validation
- Feature-specific usage tracking and limits
- Rate limiting for validation attempts
- Local storage management for license data

### 2. Feature Gating Pattern
Before any restricted action:
- Check if user can use the specific feature
- Show upgrade UI if restricted
- Execute action and increment usage if allowed

### 3. UI Integration
Include:
- License activation form with validation
- Upgrade banners that appear when limits are reached
- Usage counters showing remaining uses
- Purchase and activation buttons

## Technical Requirements

### LicenseManager Configuration

```typescript
class LicenseManager {
  private static readonly PRODUCT_ID = '[YOUR_GUMROAD_PRODUCT_ID]';
  private static readonly STORAGE_KEYS = {
    LICENSE_KEY: '[plugin-name]-license-key',
    [FEATURE_1]_USES: '[plugin-name]-[feature1]-uses',
    [FEATURE_2]_USES: '[plugin-name]-[feature2]-uses',
    VALIDATION_ATTEMPTS: '[plugin-name]-validation-attempts',
    LAST_ATTEMPT_TIME: '[plugin-name]-last-attempt-time',
    REMAINING_ACTIVATIONS: '[plugin-name]-remaining-activations'
  };
  private static readonly MAX_FREE_USES = 10;
  private static readonly MAX_LICENSE_USES = 10;
  private static readonly MAX_VALIDATION_ATTEMPTS = 15;
  private static readonly RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
}
```

### Required Methods

- `isLicenseValid()`: Check if license is activated
- `getRemainingUses(featureType)`: Get remaining free uses for specific feature
- `canUseFeature(featureType)`: Check if user can use a feature
- `incrementUsage(featureType)`: Increment usage counter after feature use
- `validateLicense(licenseKey)`: Validate license with Gumroad API
- `verifyWithGumroadAPI(licenseKey)`: Handle Gumroad API communication
- Rate limiting methods for validation attempts

### Gumroad API Integration

- Use Gumroad's `/v2/licenses/verify` endpoint
- Send form data: `product_id`, `license_key`, `increment_uses_count`
- Handle validation responses including purchase status (refunded, disputed, etc.)
- Track activation count against maximum allowed uses
- Implement proper error handling for network issues

### Feature Gating Implementation

```typescript
// Before any restricted action:
const canUse = await licenseManager.canUseFeature('feature-name');
if (!canUse) {
  showUpgradeUI('feature-name');
  return;
}
// Execute restricted action
await executeFeature();
await licenseManager.incrementUsage('feature-name');
```

### Storage Strategy

- Use `figma.clientStorage` for persistence
- Store license key, usage counts per feature, validation attempts
- Implement rate limiting data storage
- Handle storage errors gracefully

### UI Components

- License activation form with input validation
- Upgrade banner that appears when limits reached
- Usage counters showing remaining uses
- Buy button linking to Gumroad product page
- Activate button to switch to license tab
- Success/error messaging for license validation

### Manifest Configuration

```json
{
  "networkAccess": {
    "allowedDomains": ["https://api.gumroad.com"],
    "reasoning": "Required for license key validation with Gumroad API to unlock [specific features]."
  }
}
```

## User Experience Flow

1. **Free Usage**: User can use features up to the free limit (5 uses per feature)
2. **Limit Reached**: Show upgrade banner with usage counter and call-to-action
3. **Purchase**: Direct user to Gumroad for purchase
4. **Activation**: User enters license key, system validates with Gumroad
5. **Unlimited Usage**: Valid license provides unlimited access

## Error Handling & Edge Cases

- Network connectivity issues during validation
- Invalid/expired license keys
- Refunded or disputed purchases
- Rate limiting for validation attempts
- Storage failures
- API response validation

## Security Considerations

- Validate all inputs before API calls
- Implement rate limiting to prevent abuse
- Handle sensitive data appropriately
- Check purchase status (not refunded/disputed)
- Graceful degradation when offline

## Testing Features

Include a development/testing reset function to clear license data for testing purposes.

## Implementation Notes

Please implement this licensing system with clean, maintainable code following TypeScript best practices. Focus on user experience while maintaining security and preventing abuse.

The key architectural principles are:
- **Separation of concerns**: LicenseManager handles all licensing logic
- **Feature gating pattern**: Consistent check before any restricted action
- **Comprehensive UI integration**: Seamless user experience from free to paid
- **Robust error handling**: Graceful handling of all edge cases
- **Security first**: Prevent abuse while maintaining usability 