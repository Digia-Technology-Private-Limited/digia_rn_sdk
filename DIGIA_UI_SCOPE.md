# DigiaUIScope - React Context

The DigiaUIScope provides access to Digia UI SDK features through the React component tree using React Context API.

## Overview

This is the React Native equivalent of Flutter's `InheritedWidget` pattern. It provides:

- **MessageBus**: Event-based communication system for inter-component messaging
- **Analytics Handler**: Optional analytics integration for tracking events

## Basic Usage

### 1. Wrap Your App

```tsx
import { DigiaUIScope } from '@digia/rn-sdk';

function App() {
  return (
    <DigiaUIScope>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DigiaUIScope>
  );
}
```

### 2. Access SDK Features in Components

```tsx
import { useDigiaUIScope, Message } from '@digia/rn-sdk';

function MyComponent() {
  const { messageBus, analyticsHandler } = useDigiaUIScope();

  useEffect(() => {
    // Subscribe to messages
    const subscription = messageBus.on('user-action').subscribe((message) => {
      console.log('Received:', message.payload);
    });

    return () => subscription.unsubscribe();
  }, [messageBus]);

  const handleClick = () => {
    // Send a message
    messageBus.send(new Message({
      name: 'button-click',
      payload: { buttonId: 'submit' }
    }));

    // Track analytics
    analyticsHandler?.trackEvent('button_click', { buttonId: 'submit' });
  };

  return <Button onPress={handleClick} title="Click Me" />;
}
```

## API Reference

### DigiaUIScope Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components |
| `messageBus` | `MessageBus` | No | Custom message bus instance |
| `analyticsHandler` | `DUIAnalytics` | No | Analytics handler |

### Hooks

#### `useDigiaUIScope()`

Returns the complete scope context with both messageBus and analyticsHandler.

```tsx
const { messageBus, analyticsHandler } = useDigiaUIScope();
```

**Throws**: Error if used outside of DigiaUIScope provider.

#### `useMessageBus()`

Convenience hook to access just the message bus.

```tsx
const messageBus = useMessageBus();
```

#### `useAnalytics()`

Convenience hook to access the analytics handler.

```tsx
const analytics = useAnalytics(); // May be undefined
```

## Custom Configuration

### Custom Message Bus

```tsx
import { MessageBus, DigiaUIScope } from '@digia/rn-sdk';

const customMessageBus = new MessageBus();

function App() {
  return (
    <DigiaUIScope messageBus={customMessageBus}>
      <YourApp />
    </DigiaUIScope>
  );
}
```

### Analytics Integration

```tsx
import { DUIAnalytics, DigiaUIScope } from '@digia/rn-sdk';

const analytics: DUIAnalytics = {
  trackEvent: (name, props) => {
    // Your analytics implementation
    console.log('Event:', name, props);
  },
  trackScreen: (name, props) => {
    console.log('Screen:', name, props);
  },
  setUserProperties: (props) => {
    console.log('User:', props);
  },
};

function App() {
  return (
    <DigiaUIScope analyticsHandler={analytics}>
      <YourApp />
    </DigiaUIScope>
  );
}
```

## Message Bus Pattern

### Sending Messages

```tsx
import { Message, useMessageBus } from '@digia/rn-sdk';

function Sender() {
  const messageBus = useMessageBus();

  const sendMessage = () => {
    messageBus.send(new Message({
      name: 'user-action',
      payload: { action: 'save', data: {...} },
      context: someContextRef // Optional
    }));
  };

  return <Button onPress={sendMessage} title="Send" />;
}
```

### Receiving Messages

```tsx
import { useMessageBus } from '@digia/rn-sdk';

function Receiver() {
  const messageBus = useMessageBus();

  useEffect(() => {
    // Subscribe to specific event
    const sub = messageBus.on('user-action').subscribe((message) => {
      console.log('Action:', message.payload);
    });

    return () => sub.unsubscribe();
  }, [messageBus]);

  return <View>...</View>;
}
```

### Subscribe to All Messages

```tsx
useEffect(() => {
  // Subscribe to all events (no filter)
  const sub = messageBus.on().subscribe((message) => {
    console.log('Any message:', message.name, message.payload);
  });

  return () => sub.unsubscribe();
}, [messageBus]);
```

## Architecture Notes

### React Context vs InheritedWidget

| Flutter (InheritedWidget) | React Native (Context) |
|---------------------------|------------------------|
| `InheritedWidget` | `React.createContext()` |
| `BuildContext.dependOnInheritedWidgetOfExactType()` | `useContext()` hook |
| Automatically rebuilds dependents | Manual optimization with `useMemo` |
| `of(context)` static method | Custom `useDigiaUIScope()` hook |

### Performance Optimization

The DigiaUIScope implementation uses `useMemo` to prevent unnecessary re-renders:

```tsx
const contextValue = useMemo(
  () => ({ messageBus, analyticsHandler }),
  [messageBus, analyticsHandler]
);
```

Only re-renders when messageBus or analyticsHandler instances change.

## Error Handling

If you try to use the hooks outside of a DigiaUIScope provider:

```tsx
function ComponentOutsideProvider() {
  const scope = useDigiaUIScope(); // ❌ Throws error
  // Error: useDigiaUIScope must be used within a DigiaUIScope
}
```

## Related Components

- [`MessageBus`](./MESSAGE_BUS.md) - Event communication system
- [`DUIAnalytics`](./ANALYTICS.md) - Analytics interface (to be documented)
- [`DUIAppState`](./APP_STATE.md) - Global state management

## Migration from Flutter

Flutter code:
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final scope = DigiaUIScope.of(context);
    scope.messageBus.send(Message(name: 'event'));
    return Container();
  }
}
```

React Native equivalent:
```tsx
function MyComponent() {
  const { messageBus } = useDigiaUIScope();
  
  const handleAction = () => {
    messageBus.send(new Message({ name: 'event' }));
  };
  
  return <View />;
}
```
