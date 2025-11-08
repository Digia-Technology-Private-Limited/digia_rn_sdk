import { DigiaUIManager } from '../../init/digia_ui_manager';
import { ReactiveValue } from './reactive_value';
import { storage } from '../../storage/storage';

/**
 * A reactive value that persists its value to local storage.
 * 
 * This class extends ReactiveValue to automatically save and load values
 * from persistent storage using the storage abstraction layer.
 * 
 * @template T - The type of the value being stored
 * 
 * @example
 * ```typescript
 * const counter = new PersistedReactiveValue({
 *   key: 'counter',
 *   initialValue: 0,
 *   streamName: 'counterChangeStream',
 *   fromString: (str) => parseInt(str, 10),
 *   toString: (val) => val.toString(),
 * });
 * 
 * // Value is automatically loaded from storage on creation
 * console.log(counter.value); // Previously saved value or 0
 * 
 * // Updates are automatically persisted
 * counter.update(5); // Saves to storage
 * 
 * // Cleanup
 * counter.dispose();
 * ```
 */
export class PersistedReactiveValue<T> extends ReactiveValue<T> {
    private readonly _storageKey: string;
    private readonly _deserialize: (str: string) => T;
    private readonly _serialize: (val: T) => string;

    /**
     * Create a new PersistedReactiveValue with automatic persistence.
     * 
     * @param options - Configuration options
     * @param options.key - Unique key for storage (will be prefixed with project ID)
     * @param options.initialValue - Initial value if no persisted value exists
     * @param options.streamName - Name for the change stream
     * @param options.fromString - Function to deserialize from stored string to value
     * @param options.toString - Function to serialize value to string for storage
     */
    constructor(options: {
        key: string;
        initialValue: T;
        streamName: string;
        fromString: (str: string) => T;
        toString: (val: T) => string;
    }) {
        // Load the initial value from storage or use the provided default
        const loadedValue = PersistedReactiveValue._loadValue(
            options.key,
            options.initialValue,
            options.fromString
        );

        // Initialize the parent ReactiveValue with the loaded value
        super(loadedValue, options.streamName);

        this._storageKey = PersistedReactiveValue._createStorageKey(options.key);
        this._deserialize = options.fromString;
        this._serialize = options.toString;
    }

    /**
     * Load a value from storage.
     * 
     * @param key - The storage key
     * @param initialValue - Default value if nothing is stored
     * @param fromString - Deserialization function
     * @returns The loaded value or the initial value
     */
    private static _loadValue<T>(
        key: string,
        initialValue: T,
        fromString: (str: string) => T
    ): T {
        try {
            const storageKey = PersistedReactiveValue._createStorageKey(key);
            const stored = storage.getString(storageKey);

            if (stored !== null && stored !== undefined) {
                return fromString(stored);
            }
        } catch (error) {
            console.warn(`Failed to load persisted value for key "${key}":`, error);
        }

        return initialValue;
    }

    /**
     * Create a prefixed storage key using the project ID.
     * 
     * This ensures app state keys are scoped to the specific Digia project,
     * preventing conflicts between different projects.
     * 
     * @param key - The base key
     * @returns The prefixed storage key
     */
    private static _createStorageKey(key: string): string {
        // TODO: R1.0 Why is this needed?
        const projectId = DigiaUIManager.getInstance().safeInstance?.initConfig.accessKey ?? 'default';
        return `${projectId}_app_state_${key}`;
    }

    /**
     * Update the value and persist it to storage.
     * 
     * Overrides the parent update method to add automatic persistence.
     * Only persists if the value actually changed.
     * 
     * @param newValue - The new value to set
     * @returns True if the value was changed and persisted, false otherwise
     */
    override update(newValue: T): boolean {
        const updated = super.update(newValue);

        if (updated) {
            try {
                const serialized = this._serialize(newValue);
                storage.setString(this._storageKey, serialized);
            } catch (error) {
                console.error(`Failed to persist value for key "${this._storageKey}":`, error);
            }
        }

        return updated;
    }

    /**
     * Remove the persisted value from storage.
     * 
     * This does not dispose the reactive value, it only clears the persisted data.
     * The in-memory value remains unchanged.
     */
    clearPersistedValue(): void {
        try {
            storage.remove(this._storageKey);
        } catch (error) {
            console.error(`Failed to clear persisted value for key "${this._storageKey}":`, error);
        }
    }

    /**
     * Reload the value from storage, overwriting the current in-memory value.
     * 
     * @param defaultValue - Value to use if nothing is stored
     * @returns True if the value was changed, false otherwise
     */
    reload(defaultValue: T): boolean {
        try {
            const stored = storage.getString(this._storageKey);

            if (stored !== null && stored !== undefined) {
                const deserialized = this._deserialize(stored);
                return this.update(deserialized);
            } else {
                return this.update(defaultValue);
            }
        } catch (error) {
            console.error(`Failed to reload persisted value for key "${this._storageKey}":`, error);
            return this.update(defaultValue);
        }
    }

    /**
     * Get the storage key used for persistence.
     */
    get storageKey(): string {
        return this._storageKey;
    }
}

/**
 * Helper functions for creating common persisted reactive values.
 */
export namespace PersistedReactiveValue {
    /**
     * Create a persisted reactive value for a string.
     */
    export function string(options: {
        key: string;
        initialValue: string;
        streamName: string;
    }): PersistedReactiveValue<string> {
        return new PersistedReactiveValue({
            ...options,
            fromString: (str) => str,
            toString: (val) => val,
        });
    }

    /**
     * Create a persisted reactive value for a number.
     */
    export function number(options: {
        key: string;
        initialValue: number;
        streamName: string;
    }): PersistedReactiveValue<number> {
        return new PersistedReactiveValue({
            ...options,
            fromString: (str) => parseFloat(str),
            toString: (val) => val.toString(),
        });
    }

    /**
     * Create a persisted reactive value for a boolean.
     */
    export function boolean(options: {
        key: string;
        initialValue: boolean;
        streamName: string;
    }): PersistedReactiveValue<boolean> {
        return new PersistedReactiveValue({
            ...options,
            fromString: (str) => str === 'true',
            toString: (val) => val.toString(),
        });
    }

    /**
     * Create a persisted reactive value for a JSON object.
     */
    export function json<T>(options: {
        key: string;
        initialValue: T;
        streamName: string;
    }): PersistedReactiveValue<T> {
        return new PersistedReactiveValue({
            ...options,
            fromString: (str) => JSON.parse(str) as T,
            toString: (val) => JSON.stringify(val),
        });
    }
}
