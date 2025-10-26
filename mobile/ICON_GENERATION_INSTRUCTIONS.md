# Icon and Splash Screen Generation Instructions

## Automated Generation (Recommended)

### Option 1: Using npx (easiest)
```bash
cd /Users/alihassan/Downloads/nutrition-care-app/mobile

# Generate all icons and splash screens automatically
npx expo-splash-screen --background-color "#F5F7FA" --image-path ./assets/splash-design.svg
```

### Option 2: Online Converter (if you prefer visual design)

1. **Visit:** https://www.appicon.co/ or https://makeappicon.com/
2. **Upload:** `assets/app-icon-design.svg`
3. **Download** the generated icon pack
4. **Replace** the following files:
   - `assets/icon.png` (1024x1024)
   - `assets/adaptive-icon.png` (1024x1024)
   - `assets/favicon.png` (48x48)

## Manual Generation (if you have ImageMagick or similar)

### For macOS/Linux:

```bash
cd /Users/alihassan/Downloads/nutrition-care-app/mobile/assets

# Install imagemagick if not already installed
# brew install imagemagick  # macOS
# sudo apt-get install imagemagick  # Linux

# Generate app icon (1024x1024)
convert app-icon-design.svg -resize 1024x1024 icon.png

# Generate adaptive icon (1024x1024)
convert app-icon-design.svg -resize 1024x1024 adaptive-icon.png

# Generate favicon (48x48)
convert app-icon-design.svg -resize 48x48 favicon.png

# Generate splash screen (1284x2778 for iPhone)
convert splash-design.svg -resize 1284x2778 splash-icon.png
```

## Quick PNG Export (Alternative - Using any image editor)

1. Open `app-icon-design.svg` in:
   - **Figma** (free): figma.com
   - **Sketch** (Mac)
   - **Adobe Illustrator**
   - **Inkscape** (free, cross-platform)

2. Export as PNG:
   - **icon.png**: 1024x1024px
   - **adaptive-icon.png**: 1024x1024px (foreground only)
   - **favicon.png**: 48x48px
   - **splash-icon.png**: 1284x2778px (or 2048x2048px)

## Design Notes

### App Icon (`app-icon-design.svg`)
- **Theme**: Health, Nutrition, Wellness
- **Primary Element**: Apple with heart (symbolizing health + nutrition)
- **Colors**: 
  - Background: Green gradient (#4CAF50 → #388E3C)
  - Apple: White with shine effect
  - Heart: Orange (#FF9800)
  - Leaf: Light green (#81C784)
- **Style**: Modern, clean, professional

### Splash Screen (`splash-design.svg`)
- **Background**: Light gradient (#F5F7FA)
- **Central Icon**: Large apple with heart
- **Text**: "Nutrition Care" + "Your Health Journey"
- **Loading Indicator**: Three animated dots (green)
- **Decorative**: Subtle molecule-style circles

## Testing

After generating the icons, rebuild your app to see the changes:

```bash
# For iOS
npx expo prebuild -p ios --clean
npx expo run:ios

# For Android
npx expo prebuild -p android --clean
npx expo run:android

# Or simply restart Expo
npx expo start --clear
```

## Current Assets Status

✅ SVG Design files created:
  - `assets/app-icon-design.svg` (Icon design)
  - `assets/splash-design.svg` (Splash screen design)

⏳ Need to generate PNG files from SVGs:
  - `assets/icon.png`
  - `assets/adaptive-icon.png`
  - `assets/favicon.png`
  - `assets/splash-icon.png`

✅ Animated splash component created:
  - `src/components/AnimatedSplash.jsx` (In-app splash animation)

## app.json Configuration

Already updated with:
- App name: "Nutrition Care"
- Splash background: #F5F7FA (light gray-blue)
- Android adaptive icon background: #4CAF50 (green)


