// Script to fix dependencies for Android build
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing dependencies for Android build...');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Update dependencies to be compatible with Expo SDK 54
  packageJson.dependencies['@react-navigation/bottom-tabs'] = '~6.5.7';
  packageJson.dependencies['@react-navigation/native'] = '~6.1.6';
  packageJson.dependencies['@react-navigation/stack'] = '~6.3.16';
  packageJson.dependencies['react-native-screens'] = '~4.0.0';
  packageJson.dependencies['react-native-safe-area-context'] = '4.14.0';
  packageJson.dependencies['react-native-gesture-handler'] = '~2.16.1';
  packageJson.dependencies['react-native-webview'] = '13.15.0';
  
  // Remove conflicting packages
  delete packageJson.dependencies['expo-firebase-core'];
  delete packageJson.dependencies['expo-firebase-recaptcha'];
  
  // Add expo-linking if missing
  if (!packageJson.dependencies['expo-linking']) {
    packageJson.dependencies['expo-linking'] = '~6.0.0'; // Compatible with Expo 54
  }
  
  // Write back the updated package.json
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Dependencies updated successfully');
  
  // Clean install
  console.log('🧹 Cleaning and reinstalling dependencies...');
  execSync('npx expo install --fix', { stdio: 'inherit' });
  
  console.log('✅ Dependencies fixed!');
  
} catch (error) {
  console.error('❌ Error fixing dependencies:', error.message);
  process.exit(1);
}