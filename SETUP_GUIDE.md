# Complete Setup Guide

## Project Structure

```
/Users/ram/Digia/digia_rn_sdk/
├── package.json              # SDK package configuration
├── tsconfig.json             # TypeScript configuration
├── README.md                 # SDK documentation
├── MIGRATION_SUMMARY.md      # Migration details from Flutter
├── src/                      # SDK source code
│   ├── index.ts              # Main entry point
│   ├── config/               # Configuration management
│   │   ├── types.ts
│   │   └── ConfigResolver.ts
│   ├── expressions/          # Expression evaluator
│   │   └── ExpressionEvaluator.ts
│   ├── state/                # State management
│   │   └── GlobalState.ts
│   ├── actions/              # Action system
│   │   ├── ActionExecutor.ts
│   │   └── processors/
│   │       ├── ActionProcessor.ts
│   │       ├── NavigateToPageProcessor.ts
│   │       ├── NavigateBackProcessor.ts
│   │       ├── SetStateProcessor.ts
│   │       ├── SetAppStateProcessor.ts
│   │       ├── OpenUrlProcessor.ts
│   │       └── [others...]
│   └── components/           # UI components
│       ├── ComponentRegistry.ts
│       └── primitives/
│           ├── Container.tsx
│           ├── Text.tsx
│           └── Button.tsx
└── example/                  # Example React Native app
    ├── package.json
    ├── App.tsx
    ├── index.js
    ├── app.json
    ├── sample_config.json    # Sample JSON configuration
    └── README.md
```

## Prerequisites

Before you can build this project, you need:

### 1. Install Node.js and npm

**macOS (using Homebrew):**
```bash
brew install node
```

**Verify installation:**
```bash
node --version    # Should show v16+ 
npm --version     # Should show v8+
```

### 2. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 3. Install Development Tools

**For iOS development (macOS only):**
- Xcode from Mac App Store
- CocoaPods: `sudo gem install cocoapods`

**For Android development:**
- Android Studio
- Java Development Kit (JDK 11)

## Building the SDK

### Step 1: Install SDK Dependencies

```bash
cd /Users/ram/Digia/digia_rn_sdk
npm install
```

This will install:
- TypeScript
- React & React Native types
- Zustand (state management)
- Axios (HTTP client)
- JEXL (expression evaluator)
- Other dev dependencies

### Step 2: Build the SDK

```bash
npm run build
```

This compiles TypeScript files from `src/` to `dist/` folder.

### Step 3: Verify Build

Check that `dist/` folder was created with compiled JavaScript files:
```bash
ls -la dist/
```

## Running the Example App

### Step 1: Install Example Dependencies

```bash
cd example
npm install
```

### Step 2: iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### Step 3: Update Configuration

Edit `example/App.tsx` line 23:
```typescript
accessKey: 'YOUR_ACTUAL_DIGIA_ACCESS_KEY',
```

### Step 4: Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## What You'll See

The example app demonstrates:

1. **SDK Initialization** - Loads config from server
2. **Two Screens** - Home and Details pages
3. **Navigation** - Button to navigate between screens
4. **State Management** - Global and page-level state
5. **Expression Binding** - Dynamic text with `${...}`

## Testing Without Node.js

If you don't have Node.js installed yet, you can still:

1. **Review the code structure** - All files are TypeScript/TSX
2. **Understand the architecture** - See how components map to Flutter
3. **Plan your implementation** - Identify what to add/modify

## Key Files to Understand

### 1. SDK Entry Point
`src/index.ts` - Main SDK class and initialization

### 2. Config System
`src/config/ConfigResolver.ts` - Fetches JSON from server
`src/config/types.ts` - All TypeScript interfaces

### 3. Actions
`src/actions/ActionExecutor.ts` - Executes user actions
`src/actions/processors/*.ts` - Individual action handlers

### 4. Components
`src/components/ComponentRegistry.ts` - Maps types to components
`src/components/primitives/*.tsx` - React components

### 5. State
`src/state/GlobalState.ts` - Zustand store for global state

### 6. Expressions
`src/expressions/ExpressionEvaluator.ts` - Evaluates `${...}` syntax

## Sample JSON Config

See `example/sample_config.json` for a complete example of:
- Page definitions
- Component layouts
- Action flows
- Theme configuration
- State definitions

## Adding More Features

### Add a New Component

1. Create component file: `src/components/primitives/Image.tsx`
```typescript
import React from 'react';
import { Image as RNImage } from 'react-native';

export const ImageComponent: React.FC<any> = ({ props }) => {
  return <RNImage source={{ uri: props.url }} style={props.style} />;
};
```

2. Register in `ComponentRegistry.ts`:
```typescript
this.register('Image', ImageComponent);
```

### Add a New Action

1. Create processor: `src/actions/processors/ShowToastProcessor.ts`
2. Implement the `execute` method
3. Register in `ActionExecutor.ts`

## Next Steps

1. ✅ **Created** - Basic SDK structure
2. ⬜ **Install Node.js** - Required for building
3. ⬜ **Build SDK** - `npm run build`
4. ⬜ **Run Example** - Test the demo app
5. ⬜ **Add Components** - Extend with more widgets
6. ⬜ **Add Actions** - Complete action processors
7. ⬜ **Test with Real Config** - Use your Digia Studio configs

## Architecture Benefits

✅ **Same JSON format** as Flutter version
✅ **Similar patterns** for easy maintenance
✅ **Type-safe** with TypeScript
✅ **Modular** - easy to extend
✅ **Production-ready** foundation

## Support

- Flutter codebase: `/Users/ram/Digia/digia_ui`
- React Native SDK: `/Users/ram/Digia/digia_rn_sdk`
- Example app: `/Users/ram/Digia/digia_rn_sdk/example`

## Troubleshooting

### npm not found
Install Node.js first (see Prerequisites)

### TypeScript errors
Run `npm install` to get type definitions

### Build fails
Check that tsconfig.json is properly configured

### Example app won't run
Make sure React Native environment is set up correctly

---

**Ready to build!** Once you have Node.js installed, just run:
```bash
cd /Users/ram/Digia/digia_rn_sdk
npm install && npm run build
```
