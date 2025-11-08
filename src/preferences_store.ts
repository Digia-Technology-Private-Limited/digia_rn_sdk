import { storage } from './storage/storage';
import { tryJsonDecode } from './framework/utils/json_util';

/**
 * Singleton preferences store for managing application preferences.
 * 
 * This class provides a convenient API for storing and retrieving preferences
 * with automatic type handling and JSON serialization for complex objects.
 * 
 * All keys are prefixed with 'digia_ui.' to avoid conflicts with other storage.
 * 
 * @example
 * ```typescript
 * const store = PreferencesStore.instance;
 * 
 * // Initialize (if using async storage adapter)
 * await store.initialize();
 * 
 * // Write values
 * store.write('theme', 'dark');
 * store.write('user', { name: 'John', age: 30 });
 * 
 * // Read values
 * const theme = store.read<string>('theme'); // 'dark'
 * const user = store.read<{ name: string; age: number }>('user');
 * 
 * // Check existence
 * if (store.contains('theme')) {
 *   console.log('Theme is set');
 * }
 * 
 * // Delete a key
 * store.delete('theme');
 * 
 * // Clear all Digia UI preferences
 * store.clear();
 * ```
 */
export class PreferencesStore {
    private static _instance: PreferencesStore;
    private static readonly KEY_PREFIX = 'digia_ui.';

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor() { }

    /**
     * Get the singleton instance of PreferencesStore.
     */
    static get instance(): PreferencesStore {
        if (!PreferencesStore._instance) {
            PreferencesStore._instance = new PreferencesStore();
        }
        return PreferencesStore._instance;
    }

    /**
     * Initialize the preferences store.
     * 
     * This is only needed if you're using an async storage adapter
     * that needs initialization. For the default in-memory storage
     * or synchronous adapters, this is optional.
     * 
     * @returns Promise that resolves when initialization is complete
     */
    async initialize(): Promise<void> {
        // If the storage adapter has an initialize method, call it
        const adapter = storage.getAdapter();
        if ('initialize' in adapter && typeof (adapter as any).initialize === 'function') {
            await (adapter as any).initialize();
        }
    }

    /**
     * Add the Digia UI prefix to a key.
     */
    private _addPrefix(key: string): string {
        return `${PreferencesStore.KEY_PREFIX}${key}`;
    }

    /**
     * Read a value from preferences.
     * 
     * @template T - The expected type of the value
     * @param key - The preference key (without prefix)
     * @param defaultValue - Optional default value if key doesn't exist
     * @returns The stored value, parsed to type T, or the default value
     * 
     * @example
     * ```typescript
     * // Simple types
     * const theme = store.read<string>('theme', 'light');
     * const count = store.read<number>('count', 0);
     * const enabled = store.read<boolean>('enabled', false);
     * 
     * // Complex objects
     * const user = store.read<{ name: string }>('user', { name: 'Guest' });
     * ```
     */
    read<T = any>(key: string, defaultValue?: T): T | null {
        const prefixedKey = this._addPrefix(key);

        // Try each storage method in order
        const stringValue = storage.getString(prefixedKey);
        if (stringValue !== null) {
            // Try to parse as JSON for complex objects
            const decoded = tryJsonDecode(stringValue);
            if (decoded !== null) {
                return decoded as T;
            }
            // Return as string if JSON parsing failed
            return stringValue as T;
        }

        const numberValue = storage.getNumber(prefixedKey);
        if (numberValue !== null) {
            return numberValue as T;
        }

        const boolValue = storage.getBoolean(prefixedKey);
        if (boolValue !== null) {
            return boolValue as T;
        }

        // Try to get as object
        const objectValue = storage.getObject<T>(prefixedKey);
        if (objectValue !== null) {
            return objectValue;
        }

        return defaultValue ?? null;
    }

    /**
     * Write a value to preferences.
     * 
     * @template T - The type of the value
     * @param key - The preference key (without prefix)
     * @param value - The value to store
     * @returns True if successful
     * 
     * @example
     * ```typescript
     * // Simple types
     * store.write('theme', 'dark');
     * store.write('count', 42);
     * store.write('enabled', true);
     * 
     * // Complex objects (automatically JSON serialized)
     * store.write('user', { name: 'John', age: 30 });
     * store.write('settings', { theme: 'dark', lang: 'en' });
     * ```
     */
    write<T = any>(key: string, value: T): boolean {
        try {
            const prefixedKey = this._addPrefix(key);

            if (typeof value === 'string') {
                storage.setString(prefixedKey, value);
            } else if (typeof value === 'number') {
                storage.setNumber(prefixedKey, value);
            } else if (typeof value === 'boolean') {
                storage.setBoolean(prefixedKey, value);
            } else {
                // For complex objects, use JSON serialization
                storage.setObject(prefixedKey, value);
            }

            return true;
        } catch (error) {
            console.error(`Failed to write preference key "${key}":`, error);
            return false;
        }
    }

    /**
     * Delete a preference.
     * 
     * @param key - The preference key (without prefix)
     * @returns True if successful
     */
    delete(key: string): boolean {
        try {
            const prefixedKey = this._addPrefix(key);
            storage.remove(prefixedKey);
            return true;
        } catch (error) {
            console.error(`Failed to delete preference key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all Digia UI preferences.
     * 
     * This only removes keys with the 'digia_ui.' prefix,
     * leaving other storage keys intact.
     * 
     * @returns True if successful
     */
    clear(): boolean {
        try {
            const allKeys = storage.getAllKeys();
            const digiaKeys = allKeys.filter(key => key.startsWith(PreferencesStore.KEY_PREFIX));

            for (const key of digiaKeys) {
                storage.remove(key);
            }

            return true;
        } catch (error) {
            console.error('Failed to clear preferences:', error);
            return false;
        }
    }

    /**
     * Check if a preference key exists.
     * 
     * @param key - The preference key (without prefix)
     * @returns True if the key exists
     */
    contains(key: string): boolean {
        const prefixedKey = this._addPrefix(key);
        return storage.getString(prefixedKey) !== null ||
            storage.getNumber(prefixedKey) !== null ||
            storage.getBoolean(prefixedKey) !== null;
    }

    /**
     * Get all Digia UI preference keys (without prefix).
     * 
     * @returns Set of all preference keys
     * 
     * @example
     * ```typescript
     * const keys = store.getKeys();
     * // Returns: Set(['theme', 'user', 'settings'])
     * // (without 'digia_ui.' prefix)
     * ```
     */
    getKeys(): Set<string> {
        const allKeys = storage.getAllKeys();
        const digiaKeys = allKeys
            .filter(key => key.startsWith(PreferencesStore.KEY_PREFIX))
            .map(key => key.substring(PreferencesStore.KEY_PREFIX.length));

        return new Set(digiaKeys);
    }

    /**
     * Get all preferences as an object.
     * 
     * @returns Object containing all preferences
     */
    getAll(): Record<string, any> {
        const result: Record<string, any> = {};
        const keys = this.getKeys();

        for (const key of keys) {
            result[key] = this.read(key);
        }

        return result;
    }
}

/**
 * Convenience function to get the PreferencesStore singleton instance.
 * 
 * @example
 * ```typescript
 * import { getPreferencesStore } from '@digia/rn-sdk';
 * 
 * const store = getPreferencesStore();
 * store.write('theme', 'dark');
 * ```
 */
export function getPreferencesStore(): PreferencesStore {
    return PreferencesStore.instance;
}
