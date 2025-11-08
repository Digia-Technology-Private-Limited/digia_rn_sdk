# Digia React Native SDK

React Native SDK for rendering server-driven UI (SDUI) from Digia Studio platform.

## 🚀 Features

- **Dynamic UI Rendering** - Render React Native components from JSON configurations
- **Action System** - Pre-built actions for navigation, API calls, state management
- **Expression Binding** - Dynamic data binding with `${expression}` syntax
- **State Management** - Global and page-level state with Zustand
- **Theme Support** - Dynamic theming from server configuration
- **Type-Safe** - Full TypeScript support

## 📦 Installation

```bash
npm install @digia/rn-sdk
# or
yarn add @digia/rn-sdk
```

### Peer Dependencies

```bash
npm install react-native @react-navigation/native @react-navigation/stack zustand axios @react-native-async-storage/async-storage
```

## 🎯 Quick Start

### 1. Initialize SDK

```tsx
import { DigiaSDK } from '@digia/rn-sdk';

// In your App.tsx
await DigiaSDK.initialize({
  accessKey: 'YOUR_ACCESS_KEY',
  baseUrl: 'https://api.digia.studio',
  environment: 'production',
});
```

### 2. Render a Page

```tsx
import { DigiaPage } from '@digia/rn-sdk';

function HomeScreen() {
  return <DigiaPage pageId="home" args={{ userId: '123' }} />;
}
```

## 🏗️ Architecture

### Core Modules

- **Config** - Load and manage JSON configurations
- **Components** - Dynamic component registry and rendering
- **Actions** - Execute user interactions and business logic
- **State** - Global and page-level state management
- **Expressions** - Evaluate dynamic expressions in JSON
- **Network** - HTTP client for API calls

## 📚 Documentation

### Configuration Structure

```json
{
  "pages": {
    "home": {
      "layout": {
        "type": "Container",
        "props": { "style": { "flex": 1 } },
        "children": [
          {
            "type": "Text",
            "props": { "text": "${user.name}" }
          }
        ]
      }
    }
  },
  "theme": {
    "colors": { "primary": "#007AFF" }
  }
}
```

### Available Actions

- `navigateToPage` - Navigate to another page
- `navigateBack` - Go back in navigation stack
- `setState` - Update page state
- `setAppState` - Update global state
- `callRestApi` - Make HTTP API calls
- `showModal` - Display modal/dialog
- `showToast` - Show toast message
- `openUrl` - Open external URL

### Built-in Components

- Container (View)
- Text
- Button
- Image
- Row (Flex Row)
- Column (Flex Column)
- ScrollView
- ListView
- TextInput
- More coming soon...

## 🔧 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run tests
npm test

# Lint
npm run lint
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md

## 📞 Support

- Documentation: https://docs.digia.studio
- Issues: https://github.com/digia/rn-sdk/issues
