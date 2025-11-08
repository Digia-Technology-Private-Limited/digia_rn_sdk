# Storage Integration with React Native AsyncStorage

This SDK uses an abstraction layer for persistent storage that can work with different storage backends.

## Default Behavior

By default, the SDK uses **in-memory storage**, which means:
- ✅ No native dependencies required
- ✅ Works immediately out of the box
- ❌ Data is lost when the app restarts

## Enabling Persistent Storage

To enable disk persistence using React Native's AsyncStorage:

### 1. Install AsyncStorage

```bash
npm install @react-native-async-storage/async-storage
```

### 2. Create a Storage Adapter

Create a file `src/storage/async-storage-adapter.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from '@digia/rn-sdk';

/**
 * AsyncStorage adapter for persistent storage.
 * 
 * Note: AsyncStorage methods are async, but our storage interface is sync.
 * This adapter uses synchronous wrappers. For production, consider using
 * a synchronous storage library or implementing proper async handling.
 */
export class AsyncStorageAdapter implements StorageAdapter {
    private cache: Map<string, string> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        // Pre-load all keys into cache for sync access
        const keys = await AsyncStorage.getAllKeys();
        const items = await AsyncStorage.multiGet(keys);
        
        items.forEach(([key, value]) => {
            if (value !== null) {
                this.cache.set(key, value);
            }
        });
        
        this.initialized = true;
    }

    getString(key: string): string | null {
        return this.cache.get(key) ?? null;
    }

    setString(key: string, value: string): void {
        this.cache.set(key, value);
        AsyncStorage.setItem(key, value).catch(err => {
            console.error('AsyncStorage setItem error:', err);
        });
    }

    getNumber(key: string): number | null {
        const value = this.cache.get(key);
        if (value === undefined) return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    setNumber(key: string, value: number): void {
        this.setString(key, value.toString());
    }

    getBoolean(key: string): boolean | null {
        const value = this.cache.get(key);
        if (value === undefined) return null;
        return value === 'true';
    }

    setBoolean(key: string, value: boolean): void {
        this.setString(key, value.toString());
    }

    remove(key: string): void {
        this.cache.delete(key);
        AsyncStorage.removeItem(key).catch(err => {
            console.error('AsyncStorage removeItem error:', err);
        });
    }

    clear(): void {
        this.cache.clear();
        AsyncStorage.clear().catch(err => {
            console.error('AsyncStorage clear error:', err);
        });
    }

    getAllKeys(): string[] {
        return Array.from(this.cache.keys());
    }
}
```

### 3. Initialize Storage Before SDK Initialization

```typescript
import { DigiaUI } from '@digia/rn-sdk';
import { storage } from '@digia/rn-sdk/storage';
import { AsyncStorageAdapter } from './storage/async-storage-adapter';

async function initializeApp() {
    // Create and initialize the storage adapter
    const storageAdapter = new AsyncStorageAdapter();
    await storageAdapter.initialize();
    
    // Set the storage adapter globally
    storage.setAdapter(storageAdapter);
    
    // Now initialize DigiaUI
    const digiaUI = await DigiaUI.initialize({
        accessKey: 'your-access-key',
        // ... other config
    });
    
    return digiaUI;
}
```

## Alternative: Synchronous Storage Libraries

For better performance, consider using a synchronous storage library:

### MMKV (Recommended)

```bash
npm install react-native-mmkv
```

```typescript
import { MMKV } from 'react-native-mmkv';
import { StorageAdapter } from '@digia/rn-sdk';

const mmkvStorage = new MMKV();

export const mmkvAdapter: StorageAdapter = {
    getString: (key) => mmkvStorage.getString(key) ?? null,
    setString: (key, value) => mmkvStorage.set(key, value),
    getNumber: (key) => mmkvStorage.getNumber(key) ?? null,
    setNumber: (key, value) => mmkvStorage.set(key, value),
    getBoolean: (key) => mmkvStorage.getBoolean(key) ?? null,
    setBoolean: (key, value) => mmkvStorage.set(key, value),
    remove: (key) => mmkvStorage.delete(key),
    clear: () => mmkvStorage.clearAll(),
    getAllKeys: () => mmkvStorage.getAllKeys(),
};

// Set it globally
import { storage } from '@digia/rn-sdk';
storage.setAdapter(mmkvAdapter);
```

## Custom Storage Implementation

You can implement your own storage backend by implementing the `StorageAdapter` interface:

```typescript
import { StorageAdapter } from '@digia/rn-sdk';

class MyCustomStorage implements StorageAdapter {
    getString(key: string): string | null { /* ... */ }
    setString(key: string, value: string): void { /* ... */ }
    getNumber(key: string): number | null { /* ... */ }
    setNumber(key: string, value: number): void { /* ... */ }
    getBoolean(key: string): boolean | null { /* ... */ }
    setBoolean(key: string, value: boolean): void { /* ... */ }
    remove(key: string): void { /* ... */ }
    clear(): void { /* ... */ }
    getAllKeys(): string[] { /* ... */ }
}

storage.setAdapter(new MyCustomStorage());
```

## Summary

| Storage Backend | Performance | Persistence | Native Dependency |
|----------------|-------------|-------------|-------------------|
| In-Memory (default) | ⚡ Fastest | ❌ No | ✅ None |
| AsyncStorage | 🐢 Slow | ✅ Yes | ⚠️ Required |
| MMKV | ⚡ Fast | ✅ Yes | ⚠️ Required |
| Custom | Varies | Varies | Varies |

**Recommendation**: Use MMKV for production apps that need persistence.
