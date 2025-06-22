# Unsplash Integration Guide

This guide explains how to integrate Unsplash images into your Figma Data Populator plugin, considering all Figma API limitations and best practices.

## Current Implementation Status

✅ **Already Implemented:**
- Basic Unsplash Source API integration (`source.unsplash.com`)
- Whitelisted domains in manifest.json
- Image loading pipeline via UI thread
- Basic product image generation

🔄 **New Enhancements:**
- Multiple Unsplash categories (nature, people, business, etc.)
- Official Unsplash API support (optional)
- Better error handling and fallbacks
- More sophisticated search options

## Figma API Constraints & Solutions

### 1. Network Access Limitations
**Constraint:** Network requests must be made from UI thread, not plugin code thread.
**Solution:** ✅ Already implemented - UI handles all fetch requests and passes image data back to plugin code.

### 2. Image Loading Process
**Constraint:** Images must be converted to `Uint8Array` before creating `ImagePaint`.
**Solution:** ✅ Your current `loadImageFromURL()` function properly handles this.

### 3. CORS Requirements
**Constraint:** All external domains must be whitelisted in manifest.json.
**Solution:** ✅ Updated manifest to include both `source.unsplash.com` and `api.unsplash.com`.

## Implementation Options

### Option 1: Enhanced Source API (Recommended)
**Pros:**
- No API key required
- No rate limits
- Already working in your plugin
- Simple URL-based requests

**Cons:**
- Limited search capabilities
- Less control over image selection
- No metadata (photographer info, etc.)

**Implementation:** Already added to `fakerConfig.ts` with 6 new categories.

### Option 2: Official Unsplash API
**Pros:**
- High-quality curated images
- Advanced search capabilities
- Image metadata available
- Better variety and relevance

**Cons:**
- Requires API key registration
- Rate limits (50 requests/hour demo, 5000/hour production)
- More complex implementation

**Setup Steps:**
1. Register at [Unsplash Developers](https://unsplash.com/developers)
2. Create an app to get Access Key
3. Replace `YOUR_ACCESS_KEY` in `dataProviders.ts`

## Usage Examples

### Basic Usage (Source API)
```typescript
// Layer names in Figma:
%unsplash_nature    // Nature photos
%unsplash_people    // People/portraits
%unsplash_business  // Business/office
%unsplash_food      // Food photography
%unsplash_travel    // Travel destinations
%unsplash_tech      // Technology/computers
```

### Advanced Usage (Official API)
```typescript
import { UnsplashProvider } from './unsplashProvider';

// Initialize provider
const unsplash = new UnsplashProvider({
  accessKey: 'your-access-key', // Optional
  useSourceAPI: false, // Use official API
  defaultSize: '800x600'
});

// Generate image URLs
const imageUrl = await unsplash.getImageURL({
  query: 'nature landscape',
  orientation: 'landscape',
  color: 'green'
});
```

## Rate Limits & Performance

### Source API
- **Rate Limit:** Very generous, no specific limits published
- **Performance:** Fast response, cached images
- **Best Practice:** Add random seeds to avoid cache issues

### Official API
- **Demo:** 50 requests/hour
- **Production:** 5000 requests/hour
- **Best Practice:** Cache results locally, batch requests

## Error Handling Strategy

The implementation includes a robust fallback system:

1. **Primary:** Try Unsplash API (if configured)
2. **Fallback 1:** Use Source API
3. **Fallback 2:** Use placeholder images (Picsum)
4. **Fallback 3:** Display error text in layer name

## Image Optimization for Figma

### Recommended Sizes
- **Small UI elements:** 200x200
- **Card images:** 400x300
- **Hero images:** 800x600
- **High-res displays:** 1200x800

### Format Considerations
- Figma automatically handles format conversion
- JPEG preferred for photos (smaller file size)
- PNG for images with transparency needs

## Implementation Checklist

- [x] Update `manifest.json` with domain whitelist
- [x] Add enhanced categories to `fakerConfig.ts`
- [x] Create `unsplashProvider.ts` utility
- [x] Update `dataProviders.ts` with API endpoints
- [ ] Add API key configuration UI (optional)
- [ ] Test with various image categories
- [ ] Add user preferences for image sizes
- [ ] Implement local caching (optional)

## Testing Strategy

### Manual Testing
1. Create layers with % prefixes: `%unsplash_nature`, `%unsplash_people`, etc.
2. Select layers and scan
3. Apply different Unsplash categories
4. Verify images load correctly
5. Test error scenarios (network issues)

### Automated Testing
```typescript
// Test URL generation
const provider = new UnsplashProvider();
const url = await provider.getImageURL({ query: 'test' });
console.assert(url.includes('source.unsplash.com'));
```

## Best Practices

### Performance
- Batch image requests when possible
- Use appropriate image sizes for use case
- Implement loading states for better UX

### User Experience
- Provide clear category names in UI
- Show loading indicators during image fetch
- Graceful error handling with meaningful messages

### API Usage
- Respect rate limits
- Cache frequently used images
- Provide attribution when using official API

## Troubleshooting

### Common Issues

**Images not loading:**
- Check network connectivity
- Verify domain whitelist in manifest
- Check browser console for CORS errors

**Rate limit exceeded:**
- Switch to Source API temporarily
- Implement request throttling
- Consider caching strategy

**Wrong image categories:**
- Review search terms in `UnsplashCategories`
- Adjust query parameters for better results
- Use more specific search terms

## Future Enhancements

### Potential Features
- **Custom search:** Allow users to input custom search terms
- **Image sizes:** User-selectable image dimensions
- **Orientation control:** Portrait/landscape/square options
- **Color filtering:** Filter by dominant colors
- **Photographer attribution:** Display creator info
- **Local cache:** Store frequently used images
- **Batch download:** Pre-fetch multiple images

### Advanced Integration
- **AI-powered selection:** Use image recognition for better matching
- **Brand consistency:** Filter by color palettes
- **Accessibility:** Alt text generation
- **Localization:** Location-based image selection

## Support & Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Figma Plugin API Reference](https://www.figma.com/plugin-docs/)
- [Source API Documentation](https://source.unsplash.com/)
- [Image optimization best practices](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/image-optimization) 