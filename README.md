# Populate Data - Figma Plugin

A powerful Figma plugin for populating designs with realistic data including avatars, images, text, and more.

## Features

- **Real People Photos** with gender selection (RandomUser API)
- **Profile Avatars** (Pravatar)
- **Unique Generated Avatars** (Multiavatar)
- **Robot/Monster Avatars** (RoboHash)
- **Cartoon Avatars** (DiceBear)
- **Random Images** (Picsum)
- **Product Images** (DummyJSON)
- **Comprehensive CORS handling** with multiple fallback options

## Quick Start

1. Install dependencies: `npm install`
2. Build the plugin: `npm run build`
3. Load in Figma: Import the `manifest.json` file

## 🚀 Production Migration Plan

### Current Status: Production Ready ✅
- Using corsproxy.io for CORS handling (free, reliable)
- All avatar services working with gender selection
- Multiple fallback options implemented

### Future: Cloudflare Workers Migration 🔄
When ready to scale or need enterprise-grade reliability:

**Files Ready for Migration:**
- `cloudflare-cors-proxy.js` - Production Worker script
- `CLOUDFLARE_DEPLOYMENT.md` - 5-minute setup guide
- `src/corsProxyConfig.js` - Easy proxy switching
- `PRODUCTION_MIGRATION_CHECKLIST.md` - Complete migration guide

**Migration Benefits:**
- 99.9% uptime guarantee
- 100k free requests/day (3M/month)
- Global CDN performance
- Full infrastructure control
- One-line configuration change

**No Immediate Action Needed** - Current setup works perfectly!

See `PRODUCTION_MIGRATION_CHECKLIST.md` for complete details.

## Development

```bash
# Install dependencies
npm install

# Start development
npm run watch

# Build for production
npm run build
```

## Architecture

- `src/code.ts` - Main plugin logic
- `src/ui.html` - Plugin UI
- `src/ui.js` - UI interactions
- `src/dataProviders.ts` - Data generation logic
- `src/fakerConfig.ts` - Faker.js configuration
- `src/corsProxyConfig.js` - CORS proxy management

## CORS Handling

The plugin includes comprehensive CORS workarounds:
- Primary: corsproxy.io (current, working)
- Backup: cors.sh, custom proxies
- Future: Cloudflare Workers (enterprise-grade)
- Automatic fallbacks for all services

## Supported Services

### Avatar Services
- **RandomUser.me** - Real people photos (with gender selection)
- **Pravatar** - Real profile photos
- **Multiavatar** - Unique generated avatars
- **RoboHash** - Robot/monster avatars
- **DiceBear** - Cartoon avatars (reliable fallback)

### Image Services
- **Picsum** - Random photos
- **Unsplash** - High-quality photos
- **DummyJSON** - Product images

All services include CORS workarounds and error handling.

## License

MIT License

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

---

**Need help?** Check the [Figma Plugin Documentation](https://www.figma.com/plugin-docs/) for more information about developing Figma plugins. 