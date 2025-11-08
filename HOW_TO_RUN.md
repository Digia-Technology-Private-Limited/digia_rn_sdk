# Quick Start: Create a Real React Native App

The example folder doesn't have native iOS/Android folders. Here's how to create a proper React Native app with the SDK:

## Option 1: New React Native Project (Recommended)

```bash
# Navigate to workspace
cd /Users/ram/Digia

# Create new React Native project
npx react-native@latest init DigiaApp

# Go into the project
cd DigiaApp

# Install SDK from local path
npm install ../digia_rn_sdk

# Install required dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install zustand @react-native-async-storage/async-storage

# For iOS (if on macOS)
cd ios && pod install && cd ..

# Run the app
npm run android
# or
npm run ios
```

## Option 2: Use SDK in Existing RN Project

If you already have a React Native project:

```bash
cd /path/to/your/rn/project

# Install the SDK
npm install /Users/ram/Digia/digia_rn_sdk

# Install peer dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install zustand @react-native-async-storage/async-storage

# For iOS
cd ios && pod install && cd ..
```

## Update Your App.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { DigiaSDK } from '@digia/rn-sdk';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSDK();
  }, []);

  const initSDK = async () => {
    try {
      await DigiaSDK.initialize({
        accessKey: 'YOUR_ACCESS_KEY',
        baseUrl: 'https://api.digia.studio',
        environment: 'development',
      });
      setReady(true);
    } catch (error) {
      console.error('SDK init failed:', error);
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Digia SDK Ready! ✅</Text>
    </View>
  );
}
```

## Why the Example Folder Didn't Work

The `example/` folder only has:
- ❌ No `android/` folder (required for Android)
- ❌ No `ios/` folder (required for iOS)
- ❌ No native dependencies setup
- ✅ Just reference code to show SDK usage

React Native requires these native folders for compilation.

## Recommended Approach

1. ✅ Create a fresh React Native project (Option 1 above)
2. ✅ Install the SDK from local path
3. ✅ Copy example code patterns
4. ✅ Run on device/simulator

## The SDK is Ready!

The SDK itself (`/Users/ram/Digia/digia_rn_sdk/dist`) is fully built and working. It just needs to be used within a proper React Native app that has the native build system set up.

---

**Next command to run:**

```bash
cd /Users/ram/Digia
npx react-native@latest init DigiaApp
cd DigiaApp
npm install ../digia_rn_sdk
npm run android
```

This will create a proper React Native app that can use your SDK! 🚀
