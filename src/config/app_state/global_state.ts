import { Subscription } from 'rxjs';
import { PreferencesStore } from '../../preferences_store';
import { ReactiveValue } from './reactive_value';
import { DefaultReactiveValueFactory } from './reactive_value_factory';
import { StateDescriptorFactory } from './state_descriptor_parser';

/**
 * Global state manager that holds multiple reactive values.
 * 
 * This singleton class manages all application state values, providing
 * type-safe access to reactive state with automatic persistence support.
 * 
 * @example
 * ```typescript
 * const appState = DUIAppState.instance;
 * 
 * // Initialize with state descriptors from config
 * await appState.init([
 *   {
 *     type: 'number',
 *     name: 'counter',
 *     value: 0,
 *     shouldPersist: true,
 *     streamName: 'counterChangeStream'
 *   },
 *   {
 *     type: 'string',
 *     name: 'userName',
 *     value: '',
 *     shouldPersist: false,
 *     streamName: 'userNameChangeStream'
 *   }
 * ]);
 * 
 * // Get a reactive value
 * const counter = appState.get<number>('counter');
 * 
 * // Get current value
 * const count = appState.getValue<number>('counter');
 * 
 * // Update a value
 * appState.update('counter', 5);
 * 
 * // Listen to changes
 * const subscription = appState.listen<number>('counter', (value) => {
 *   console.log('Counter changed:', value);
 * });
 * 
 * // Cleanup
 * subscription.unsubscribe();
 * appState.dispose();
 * ```
 */
export class DUIAppState {
    private static _instance: DUIAppState;

    private readonly _values: Map<string, ReactiveValue<any>> = new Map();
    private _isInitialized: boolean = false;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor() { }

    /**
     * Get the singleton instance of DUIAppState.
     */
    static get instance(): DUIAppState {
        if (!DUIAppState._instance) {
            DUIAppState._instance = new DUIAppState();
        }
        return DUIAppState._instance;
    }

    /**
     * Initialize the global state with state descriptors.
     * 
     * If already initialized, this will dispose existing values and re-initialize.
     * 
     * @param values - Array of state descriptor JSON objects
     * @throws Error if duplicate state keys are found
     * 
     * @example
     * ```typescript
     * await appState.init([
     *   {
     *     type: 'number',
     *     name: 'counter',
     *     value: 0,
     *     shouldPersist: true,
     *     streamName: 'counterChangeStream'
     *   }
     * ]);
     * ```
     */
    async init(values: any[]): Promise<void> {
        if (this._isInitialized) {
            this.dispose();
        }

        // Initialize preferences store if needed
        await PreferencesStore.instance.initialize();

        // Parse descriptors from JSON
        const factory = new StateDescriptorFactory();
        const descriptors = values.map(v => factory.fromJson(v));

        // Create reactive values from descriptors
        const reactiveFactory = new DefaultReactiveValueFactory();

        for (const descriptor of descriptors) {
            if (this._values.has(descriptor.key)) {
                throw new Error(`Duplicate state key: ${descriptor.key}`);
            }

            // Create either PersistedReactiveValue or ReactiveValue based on shouldPersist
            const value = reactiveFactory.create(descriptor);
            this._values.set(descriptor.key, value);
        }

        this._isInitialized = true;
    }

    /**
     * Get a reactive value by key.
     * 
     * @template T - The type of the value
     * @param key - The state key
     * @returns The ReactiveValue instance
     * @throws Error if not initialized or key not found
     * 
     * @example
     * ```typescript
     * const counter = appState.get<number>('counter');
     * console.log(counter.value); // Current value
     * counter.update(10); // Update value
     * ```
     */
    get<T = any>(key: string): ReactiveValue<T> {
        if (!this._isInitialized) {
            throw new Error('DUIAppState must be initialized before getting values');
        }

        if (!this._values.has(key)) {
            throw new Error(`State key "${key}" not found`);
        }

        return this._values.get(key) as ReactiveValue<T>;
    }

    /**
     * Get the current value by key (convenience method).
     * 
     * @template T - The type of the value
     * @param key - The state key
     * @returns The current value
     * 
     * @example
     * ```typescript
     * const count = appState.getValue<number>('counter');
     * const name = appState.getValue<string>('userName');
     * ```
     */
    getValue<T = any>(key: string): T {
        return this.get<T>(key).value;
    }

    /**
     * Get all reactive values as a map.
     * 
     * @returns Map of all state keys to their ReactiveValue instances
     */
    get values(): Map<string, ReactiveValue<any>> {
        return new Map(this._values);
    }

    /**
     * Update a value by key.
     * 
     * @template T - The type of the value
     * @param key - The state key
     * @param newValue - The new value to set
     * @returns True if the value was changed, false if unchanged
     * 
     * @example
     * ```typescript
     * const changed = appState.update('counter', 5);
     * if (changed) {
     *   console.log('Value was updated');
     * }
     * ```
     */
    update<T = any>(key: string, newValue: T): boolean {
        return this.get<T>(key).update(newValue);
    }

    /**
     * Listen to changes of a value.
     * 
     * @template T - The type of the value
     * @param key - The state key
     * @param onData - Callback function called when value changes
     * @returns Subscription that can be unsubscribed
     * 
     * @example
     * ```typescript
     * const subscription = appState.listen<number>('counter', (value) => {
     *   console.log('Counter changed to:', value);
     * });
     * 
     * // Later, cleanup
     * subscription.unsubscribe();
     * ```
     */
    listen<T = any>(key: string, onData: (value: T) => void): Subscription {
        return this.get<T>(key).controller.subscribe(onData);
    }

    /**
     * Check if a state key exists.
     * 
     * @param key - The state key to check
     * @returns True if the key exists
     */
    has(key: string): boolean {
        return this._values.has(key);
    }

    /**
     * Get all state keys.
     * 
     * @returns Array of all state keys
     */
    getKeys(): string[] {
        return Array.from(this._values.keys());
    }

    /**
     * Get the current state as a plain object.
     * 
     * @returns Object with all state keys and their current values
     */
    toObject(): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [key, reactiveValue] of this._values) {
            result[key] = reactiveValue.value;
        }
        return result;
    }

    /**
     * Check if the state manager is initialized.
     * 
     * @returns True if initialized
     */
    get isInitialized(): boolean {
        return this._isInitialized;
    }

    /**
     * Dispose all registered values and reset the state manager.
     * 
     * This will:
     * - Dispose all reactive values (closing their streams)
     * - Clear the internal values map
     * - Mark the state as uninitialized
     * 
     * @example
     * ```typescript
     * // Cleanup when unmounting or resetting
     * appState.dispose();
     * ```
     */
    dispose(): void {
        for (const value of this._values.values()) {
            value.dispose();
        }
        this._values.clear();
        this._isInitialized = false;
    }
}

/**
 * Convenience function to get the DUIAppState singleton instance.
 * 
 * @example
 * ```typescript
 * import { getAppState } from '@digia/rn-sdk';
 * 
 * const appState = getAppState();
 * const counter = appState.getValue<number>('counter');
 * ```
 */
export function getAppState(): DUIAppState {
    return DUIAppState.instance;
}
