// #!/usr/bin/env node

// /**
//  * SDK Test Script
//  * Tests the Digia SDK without React Native
//  */

// console.log('🧪 Testing Digia React Native SDK...\n');

// // Test 1: Import SDK
// console.log('✓ Test 1: Importing SDK modules...');
// try {
//   const sdk = require('./dist/index.js');
//   console.log('  ✅ SDK imported successfully');
//   console.log('  - DigiaSDK class found:', typeof sdk.DigiaSDK === 'function');
//   console.log('  - ActionExecutor found:', typeof sdk.actionExecutor === 'object');
//   console.log('  - ComponentRegistry found:', typeof sdk.componentRegistry === 'object');
// } catch (error) {
//   console.error('  ❌ Failed to import SDK:', error.message);
//   process.exit(1);
// }

// // Test 2: Config Types
// console.log('\n✓ Test 2: Checking configuration types...');
// try {
//   const sampleConfig = {
//     pages: { home: { uid: 'home', pageId: 'home' } },
//     theme: { colors: { primary: '#007AFF' } },
//     rest: { baseUrl: 'https://api.example.com' },
//     appSettings: { initialRoute: 'home' },
//   };
//   console.log('  ✅ Configuration structure valid');
//   console.log('  - Pages:', Object.keys(sampleConfig.pages).length);
//   console.log('  - Initial route:', sampleConfig.appSettings.initialRoute);
// } catch (error) {
//   console.error('  ❌ Config test failed:', error.message);
// }

// // Test 3: Component Registry
// console.log('\n✓ Test 3: Testing Component Registry...');
// try {
//   const { componentRegistry } = require('./dist/index.js');
//   console.log('  ✅ Component Registry initialized');
//   console.log('  - Has Container:', componentRegistry.has('Container'));
//   console.log('  - Has Text:', componentRegistry.has('Text'));
//   console.log('  - Has Button:', componentRegistry.has('Button'));
// } catch (error) {
//   console.error('  ❌ Component Registry test failed:', error.message);
// }

// // Test 4: Action Processors
// console.log('\n✓ Test 4: Testing Action System...');
// try {
//   const { actionExecutor } = require('./dist/index.js');
//   console.log('  ✅ Action Executor initialized');
//   console.log('  - Type:', typeof actionExecutor);
// } catch (error) {
//   console.error('  ❌ Action System test failed:', error.message);
// }

// // Test 5: Expression Evaluator
// console.log('\n✓ Test 5: Testing Expression Evaluator...');
// try {
//   const { expressionEvaluator } = require('./dist/index.js');
//   console.log('  ✅ Expression Evaluator initialized');

//   // Test expression detection
//   const hasExpr1 = expressionEvaluator.hasExpression('${user.name}');
//   const hasExpr2 = expressionEvaluator.hasExpression('plain text');
//   console.log('  - Detects ${...}:', hasExpr1 === true);
//   console.log('  - Ignores plain text:', hasExpr2 === false);

//   // Test expression extraction
//   const extracted = expressionEvaluator.extractExpression('${user.name}');
//   console.log('  - Extracts expression:', extracted === 'user.name');
// } catch (error) {
//   console.error('  ❌ Expression Evaluator test failed:', error.message);
// }

// // Test 6: Build Output
// console.log('\n✓ Test 6: Checking build output...');
// const fs = require('fs');
// const path = require('path');

// try {
//   const distPath = path.join(__dirname, 'dist');
//   const files = fs.readdirSync(distPath);
//   console.log('  ✅ Build output exists');
//   console.log('  - Folders:', files.filter(f => fs.statSync(path.join(distPath, f)).isDirectory()).join(', '));
//   console.log('  - Entry point:', fs.existsSync(path.join(distPath, 'index.js')) ? '✓' : '✗');
//   console.log('  - Type definitions:', fs.existsSync(path.join(distPath, 'index.d.ts')) ? '✓' : '✗');
// } catch (error) {
//   console.error('  ❌ Build output check failed:', error.message);
// }

// // Summary
// console.log('\n' + '='.repeat(50));
// console.log('📊 TEST SUMMARY');
// console.log('='.repeat(50));
// console.log('✅ All core SDK modules are working!');
// console.log('✅ Build successful and imports work');
// console.log('✅ Ready to use in React Native projects');
// console.log('\n💡 To use in a React Native app:');
// console.log('   1. Create RN project: npx react-native init YourApp');
// console.log('   2. Install SDK: npm install /Users/ram/Digia/digia_rn_sdk');
// console.log('   3. Import: import { DigiaSDK } from "@digia/rn-sdk"');
// console.log('   4. Initialize and use!');
// console.log('='.repeat(50) + '\n');



// test-sdk-fixed.js
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Digia React Native SDK...\n');

const sdkPath = path.resolve(__dirname, 'dist/index.js');
console.log('SDK file path:', sdkPath);

// Check if file exists
if (!fs.existsSync(sdkPath)) {
  console.log('❌ dist/index.js does not exist!');
  console.log('Current directory:', __dirname);
  console.log('Files in current directory:');
  fs.readdirSync(__dirname).forEach(file => {
    console.log('  -', file);
  });
  process.exit(1);
}

// Check file content
console.log('\n📄 File info:');
const stats = fs.statSync(sdkPath);
console.log('File size:', stats.size, 'bytes');

// Read first 200 characters to see what we have
const fileContent = fs.readFileSync(sdkPath, 'utf8').substring(0, 200);
console.log('First 200 chars:', fileContent);

// Check if it starts with valid JS
if (fileContent.trim().startsWith('<!DOCTYPE') || fileContent.trim().startsWith('<html')) {
  console.log('❌ File contains HTML instead of JavaScript!');
  console.log('This usually means a 404 error or wrong file path.');
} else if (fileContent.includes('use strict')) {
  console.log('✅ File contains valid JavaScript (CommonJS)');

  // Try to require the file
  try {
    const DigiaSDK = require(sdkPath);
    console.log('✅ SDK loaded successfully!');
    console.log('Available exports:', Object.keys(DigiaSDK));
  } catch (error) {
    console.log('❌ Require failed:', error.message);
    console.log('Error stack:', error.stack);
  }
} else {
  console.log('❌ File does not contain expected JavaScript content');
}