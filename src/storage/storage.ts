/**
 * Simple storage abstraction for persisting key-value pairs.
 * 
 * This module provides a unified storage interface that can work with
 * different storage backends (in-memory, AsyncStorage, custom adapter).
 * 
 * By default, it uses in-memory storage with no native dependencies.
 * You can optionally provide a custom storage adapter for disk persistence.
 */

/**
 * Storage adapter interface for custom storage implementations.
 */
export interface StorageAdapter {
    getString(key: string): string | null;
    setString(key: string, value: string): void;
    getNumber(key: string): number | null;
    setNumber(key: string, value: number): void;
    getBoolean(key: string): boolean | null;
    setBoolean(key: string, value: boolean): void;
    remove(key: string): void;
    clear(): void;
    getAllKeys(): string[];
}

/**
 * Simple in-memory storage implementation.
 * No native dependencies, but data is lost on app restart.
 */
class InMemoryStorage implements StorageAdapter {
    private data: Map<string, string> = new Map();

    getString(key: string): string | null {
        return this.data.get(key) ?? null;
    }

    setString(key: string, value: string): void {
        this.data.set(key, value);
    }

    getNumber(key: string): number | null {
        const value = this.data.get(key);
        if (value === undefined) return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    setNumber(key: string, value: number): void {
        this.data.set(key, value.toString());
    }

    getBoolean(key: string): boolean | null {
        const value = this.data.get(key);
        if (value === undefined) return null;
        return value === 'true';
    }

    setBoolean(key: string, value: boolean): void {
        this.data.set(key, value.toString());
    }

    remove(key: string): void {
        this.data.delete(key);
    }

    clear(): void {
        this.data.clear();
    }

    getAllKeys(): string[] {
        return Array.from(this.data.keys());
    }
}

/**
 * Storage wrapper that provides a consistent API.
 */
class Storage {
    private adapter: StorageAdapter;

    constructor(adapter?: StorageAdapter) {
        this.adapter = adapter ?? new InMemoryStorage();
    }

    /**
     * Set a custom storage adapter.
     * 
     * @example
     * ```typescript
     * import AsyncStorage from '@react-native-async-storage/async-storage';
     * 
     * const asyncStorageAdapter: StorageAdapter = {
     *   getString: (key) => AsyncStorage.getItem(key),
     *   setString: (key, value) => AsyncStorage.setItem(key, value),
     *   // ... implement other methods
     * };
     * 
     * storage.setAdapter(asyncStorageAdapter);
     * ```
     */
    setAdapter(adapter: StorageAdapter): void {
        this.adapter = adapter;
    }

    /**
     * Get the current storage adapter.
     */
    getAdapter(): StorageAdapter {
        return this.adapter;
    }

    /**
     * Get a string value from storage.
     */
    getString(key: string): string | null {
        return this.adapter.getString(key);
    }

    /**
     * Set a string value in storage.
     */
    setString(key: string, value: string): void {
        this.adapter.setString(key, value);
    }

    /**
     * Get a number value from storage.
     */
    getNumber(key: string): number | null {
        return this.adapter.getNumber(key);
    }

    /**
     * Set a number value in storage.
     */
    setNumber(key: string, value: number): void {
        this.adapter.setNumber(key, value);
    }

    /**
     * Get a boolean value from storage.
     */
    getBoolean(key: string): boolean | null {
        return this.adapter.getBoolean(key);
    }

    /**
     * Set a boolean value in storage.
     */
    setBoolean(key: string, value: boolean): void {
        this.adapter.setBoolean(key, value);
    }

    /**
     * Get a JSON object from storage.
     */
    getObject<T>(key: string): T | null {
        const value = this.adapter.getString(key);
        if (value === null) return null;

        try {
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Failed to parse JSON from storage key "${key}":`, error);
            return null;
        }
    }

    /**
     * Set a JSON object in storage.
     */
    setObject<T>(key: string, value: T): void {
        try {
            const json = JSON.stringify(value);
            this.adapter.setString(key, json);
        } catch (error) {
            console.error(`Failed to stringify object for storage key "${key}":`, error);
        }
    }

    /**
     * Remove a value from storage.
     */
    remove(key: string): void {
        this.adapter.remove(key);
    }

    /**
     * Clear all values from storage.
     */
    clear(): void {
        this.adapter.clear();
    }

    /**
     * Get all storage keys.
     */
    getAllKeys(): string[] {
        return this.adapter.getAllKeys();
    }
}

/**
 * Default storage instance.
 * 
 * Uses in-memory storage by default. You can set a custom adapter
 * using `storage.setAdapter()` to enable disk persistence.
 */
export const storage = new Storage();
