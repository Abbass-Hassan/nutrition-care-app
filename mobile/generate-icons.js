// Simple icon generator script
// This creates basic PNG icons with emoji as a temporary solution
// For production, use proper design tools or icon services

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('📱 Nutrition Care - Icon Generator\n');

// Check if we can use ImageMagick
try {
  execSync('which convert', { stdio: 'ignore' });
  console.log('✅ ImageMagick found! Converting SVG to PNG...\n');
  
  const assetsDir = path.join(__dirname, 'assets');
  
  // Convert SVGs to PNGs
  try {
    execSync(`convert ${assetsDir}/app-icon-design.svg -resize 1024x1024 ${assetsDir}/icon.png`);
    console.log('✅ Generated icon.png (1024x1024)');
  } catch (e) {
    console.log('⚠️  Could not generate icon.png');
  }
  
  try {
    execSync(`convert ${assetsDir}/app-icon-design.svg -resize 1024x1024 ${assetsDir}/adaptive-icon.png`);
    console.log('✅ Generated adaptive-icon.png (1024x1024)');
  } catch (e) {
    console.log('⚠️  Could not generate adaptive-icon.png');
  }
  
  try {
    execSync(`convert ${assetsDir}/app-icon-design.svg -resize 48x48 ${assetsDir}/favicon.png`);
    console.log('✅ Generated favicon.png (48x48)');
  } catch (e) {
    console.log('⚠️  Could not generate favicon.png');
  }
  
  try {
    execSync(`convert ${assetsDir}/splash-design.svg -resize 1284x2778 ${assetsDir}/splash-icon.png`);
    console.log('✅ Generated splash-icon.png (1284x2778)');
  } catch (e) {
    console.log('⚠️  Could not generate splash-icon.png');
  }
  
  console.log('\n✅ All icons generated successfully!');
  console.log('   Run "npx expo start --clear" to see the new icons\n');
  
} catch (error) {
  console.log('⚠️  ImageMagick not found. Please install it or use one of these options:\n');
  console.log('Option 1 - Install ImageMagick:');
  console.log('  macOS:  brew install imagemagick');
  console.log('  Linux:  sudo apt-get install imagemagick\n');
  console.log('Option 2 - Use online tools:');
  console.log('  • Visit https://www.appicon.co/');
  console.log('  • Upload: assets/app-icon-design.svg');
  console.log('  • Download and replace the PNG files in assets/\n');
  console.log('Option 3 - Use Figma/Sketch/Illustrator:');
  console.log('  • Open assets/app-icon-design.svg');
  console.log('  • Export as PNG (1024x1024 for icon, 1284x2778 for splash)\n');
  console.log('See ICON_GENERATION_INSTRUCTIONS.md for detailed steps.\n');
}


