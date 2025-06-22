# Demo: Using Enhanced Unsplash Integration

This demo shows how to use the new Unsplash categories in your Figma Data Populator plugin.

## Quick Start

### 1. Layer Naming
Create layers in Figma with these names:
```
%unsplash_nature     → Nature/landscape photos
%unsplash_people     → People/portrait photos  
%unsplash_business   → Business/office photos
%unsplash_food       → Food photography
%unsplash_travel     → Travel destinations
%unsplash_tech       → Technology/computer photos
```

### 2. Plugin Usage
1. Select your layers or frames
2. Open "Data Populator" plugin
3. Click "Scan Selected Layers"
4. Choose "Image" category for each layer
5. Select specific Unsplash category from dropdown
6. Click "Apply Data to Layers"

## Example Figma Setup

```
Card Component
├── %unsplash_food (Rectangle - for food image)
├── %name (Text - for restaurant name)
├── %city (Text - for location)
└── %currency (Text - for price)

Profile Component  
├── %unsplash_people (Ellipse - for profile photo)
├── %name (Text - for person name)
├── %email (Text - for email)
└── %company (Text - for company)

Hero Section
├── %unsplash_travel (Rectangle - for hero image)
├── %post_title (Text - for headline)
└── %description (Text - for description)
```

## URL Examples Generated

```typescript
// Nature photos
https://source.unsplash.com/400x300/?nature,landscape,8472

// People photos  
https://source.unsplash.com/400x300/?people,portrait,1953

// Business photos
https://source.unsplash.com/400x300/?business,office,7291

// Food photos
https://source.unsplash.com/400x300/?food,6485

// Travel photos
https://source.unsplash.com/400x300/?travel,Tokyo,3746

// Technology photos
https://source.unsplash.com/400x300/?technology,computer,9138
```

## Testing the Integration

### Manual Test
1. Create a rectangle named `%unsplash_nature`
2. Select it and run the plugin
3. Choose Image → Nature Photos (Unsplash)
4. Apply data
5. Verify a nature image appears

### Batch Test
Create multiple components with different categories and test them all at once:
- `%unsplash_food` for a restaurant card
- `%unsplash_people` for team member profiles  
- `%unsplash_business` for office spaces
- `%unsplash_travel` for destination cards

## Troubleshooting

**Image not loading?**
- Check internet connection
- Wait a few seconds for image download
- Try refreshing/reapplying

**Wrong image category?**
- Double-check the layer name prefix matches exactly
- Ensure you selected the right category in the dropdown

**Rate limit issues?**
- The Source API is very generous, this shouldn't happen
- If it does, wait a minute and try again

## Next Steps

- Test with your actual design components
- Try different layer naming conventions
- Experiment with various image categories
- Consider upgrading to official Unsplash API for more control 