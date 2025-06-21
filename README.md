# Figma Data Populator Plugin

A powerful Figma plugin that automatically populates layers with real data based on % prefixes in layer names. Perfect for creating realistic mockups and prototypes with dynamic content.

## Features

### 🔍 **Smart Layer Scanning**
- Automatically detects layers with % prefixes (e.g., `%name`, `%price`, `%avatar`)
- Groups layers by matching names
- Shows count of layers for each prefix

### 📊 **Rich Data Types**
- **Text**: Names, usernames, cities, countries, post titles, descriptions, lorem ipsum, product names, company names, emails
- **Numbers**: Integers, decimals, currency, dates, phone numbers, percentages
- **Images**: Avatars, random images, product images

### 🌐 **Multiple Data Sources**
- **Local Data**: Uses faker.js-like generators for offline functionality
- **External APIs**: 
  - RandomUser.me for realistic avatars
  - DummyJSON for product data
  - Picsum Photos for placeholder images
  - Unsplash Source for high-quality images

### 🎨 **Modern UI**
- Clean, intuitive interface
- Category-based data type selection
- Real-time validation and feedback
- Loading states and status messages

## Installation

### Option 1: Development Mode
1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Figma, go to **Plugins** → **Development** → **Import plugin from manifest**
5. Select the `manifest.json` file from this directory

### Option 2: Manual Setup
1. Copy all files to a new directory
2. In Figma, go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file

## Usage

### 1. Prepare Your Layers
Create layers in Figma with names starting with `%`:
- `%name` - for person names
- `%city` - for city names
- `%price` - for pricing
- `%avatar` - for profile pictures
- `%description` - for text content

### 2. Select and Scan
1. Select the layers or frames containing layers with % prefixes
2. Open the **Data Populator** plugin
3. Click **"Scan Selected Layers"**

### 3. Assign Data Types
For each detected prefix:
1. Choose a **Category** (Text, Number, or Image)
2. Select a specific **Data Type** from the dropdown
3. Remove any unwanted mappings using the "Remove" button

### 4. Apply Data
1. Click **"Apply Data to Layers"** 
2. Watch as your layers get populated with realistic data!

## Data Type Reference

### Text Data Types
- **Names**: Full person names (e.g., "John Smith")
- **Usernames**: Social media style usernames (e.g., "user123")
- **Cities**: World city names (e.g., "New York", "London")
- **Countries**: Country names (e.g., "United States", "France")
- **Post Titles**: Blog/article titles
- **Descriptions**: Lorem ipsum paragraphs
- **Lorem Ipsum**: Short lorem ipsum phrases
- **Product Names**: Product titles (e.g., "Awesome Widget")
- **Company Names**: Business names (e.g., "TechCorp")
- **Email Addresses**: Realistic email addresses

### Number Data Types
- **Integers**: Whole numbers (1-1000)
- **Decimals**: Decimal numbers (0.00-100.00)
- **Currency**: Formatted prices ($1.00-$999.00)
- **Dates**: Recent dates in local format
- **Phone Numbers**: US phone number format
- **Percentages**: Percentage values (0%-100%)

### Image Data Types
- **Avatars**: Profile picture avatars from DiceBear
- **Random Images**: Placeholder images from Picsum
- **Product Images**: Product photos from Unsplash
- **Avatar (RandomUser)**: Real person photos from RandomUser API
- **Product Image (DummyJSON)**: Product images from DummyJSON API

## Plugin Architecture

### Core Files
- `code.ts` - Main plugin logic (layer scanning, data application)
- `ui.html` - User interface HTML
- `ui.js` - UI JavaScript and data generation
- `manifest.json` - Figma plugin configuration

### Optional Files (for advanced usage)
- `fakerConfig.ts` - Faker.js configuration and data types
- `dataProviders.ts` - External API data providers

## Troubleshooting

### Common Issues

**"No layers found"**
- Make sure layer names start with `%` character
- Ensure layers are selected before scanning
- Check that layers are not hidden or locked

**"Error loading data"**
- Check internet connection for external APIs
- Some APIs may have rate limits
- Plugin will fallback to local data if APIs fail

**Images not loading**
- Verify network connectivity
- Some corporate networks may block external image URLs
- Try using local image data types instead

### Performance Tips
- For large selections, consider scanning in smaller batches
- External API calls may be slower than local data generation
- Images require downloading and may take longer to apply

## Development

### Building from Source
```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

### File Structure
```
populate-data/
├── manifest.json           # Plugin configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── src/
│   ├── code.ts           # Main plugin code
│   ├── ui.html           # UI interface
│   ├── ui.js             # UI JavaScript
│   ├── fakerConfig.ts    # Data type definitions
│   └── dataProviders.ts  # API data providers
└── dist/                 # Compiled output
    ├── code.js
    ├── ui.html
    └── ui.js
```

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

---

**Need help?** Check the [Figma Plugin Documentation](https://www.figma.com/plugin-docs/) for more information about developing Figma plugins. 