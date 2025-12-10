import { ExprContext, BasicExprContext } from 'digia_expr';
import { ReactiveValue } from './reactive_value';

/**
 * Expression context for application state management.
 * 
 * This context provides access to reactive application state values and their
 * associated stream controllers for change notifications. It extends the basic
 * expression context to provide special handling for the 'appState' key and
 * reactive value lookups.
 * 
 * @example
 * ```typescript
 * const appStateContext = new AppStateScopeContext({
 *   values: {
 *     counter: new ReactiveValue(0, 'counterChangeStream'),
 *     userName: new ReactiveValue('John', 'userNameChangeStream'),
 *   },
 *   variables: { theme: 'dark' },
 * });
 * 
 * // Access a reactive value
 * const result = appStateContext.getValue('counter');
 * // { found: true, value: 0 }
 * 
 * // Access the stream controller
 * const stream = appStateContext.getValue('counterChangeStream');
 * // { found: true, value: <Subject> }
 * 
 * // Access the entire appState object
 * const state = appStateContext.getValue('appState');
 * // { found: true, value: { counter: 0, userName: 'John', counterChangeStream: <Subject>, ... } }
 * ```
 */
export class AppStateScopeContext extends BasicExprContext {
    private readonly _values: Map<string, ReactiveValue<any>>;

    constructor(options: {
        values: Record<string, ReactiveValue<any>> | Map<string, ReactiveValue<any>>;
        variables?: Record<string, any> | Map<string, any>;
        enclosing?: ExprContext | null;
    }) {
        // Convert values to Map if it's a Record
        const valuesMap = options.values instanceof Map
            ? options.values
            : new Map(Object.entries(options.values));

        // Convert variables to Map if provided
        const variablesMap = options.variables
            ? (options.variables instanceof Map
                ? options.variables
                : new Map(Object.entries(options.variables)))
            : new Map<string, any>();

        super({
            name: 'appState',
            variables: variablesMap,
            enclosing: options.enclosing,
        });

        this._values = valuesMap;
    }

    /**
     * Retrieve a value from the app state context.
     * 
     * Supports three types of lookups:
     * 1. 'appState' - Returns entire state object with values and stream controllers
     * 2. Direct key lookup - Returns the current value of a reactive value
     * 3. Stream name lookup (key$) - Returns the stream controller for a reactive value
     * 
     * If not found in app state, delegates to parent context.
     */
    override getValue(key: string): { found: boolean; value: any } {
        // Special case: return entire appState object
        if (key === 'appState') {
            const stateObject: Record<string, any> = {};

            // Add all current values
            for (const [k, reactiveValue] of this._values.entries()) {
                stateObject[k] = reactiveValue.value;
            }

            // Add all stream controllers
            for (const [k, reactiveValue] of this._values.entries()) {
                stateObject[reactiveValue.streamName] = reactiveValue.controller;
            }

            return {
                found: true,
                value: stateObject,
            };
        }

        // Check if key directly matches a reactive value
        if (this._values.has(key)) {
            return {
                found: true,
                value: this._values.get(key)!.value,
            };
        }

        // Check if key matches a stream name (e.g., 'counter$')
        for (const [k, reactiveValue] of this._values.entries()) {
            if (reactiveValue.streamName === key) {
                return {
                    found: true,
                    value: reactiveValue.controller,
                };
            }
        }

        // Delegate to parent context
        return super.getValue(key);
    }

    /**
     * Get all reactive values in this context.
     */
    getReactiveValues(): Map<string, ReactiveValue<any>> {
        return new Map(this._values);
    }

    /**
     * Get a specific reactive value by key.
     */
    getReactiveValue(key: string): ReactiveValue<any> | undefined {
        return this._values.get(key);
    }

    /**
     * Check if a reactive value exists for the given key.
     */
    hasReactiveValue(key: string): boolean {
        return this._values.has(key);
    }

    /**
     * Update a reactive value using the update() method.
     * Creates a new reactive value if it doesn't exist.
     * 
     * @param key - The key for the reactive value
     * @param value - The new value to set
     * @returns True if the value was changed, false if unchanged
     */
    updateReactiveValue(key: string, value: any): boolean {
        const existing = this._values.get(key);

        if (existing) {
            return existing.update(value);
        } else {
            // Create a new reactive value with the streamName convention
            const streamName = `${key}ChangeStream`;
            const newReactive = new ReactiveValue(value, streamName);
            this._values.set(key, newReactive);
            return true;
        }
    }

    /**
     * Set or create a reactive value directly.
     * 
     * @param key - The key for the reactive value  
     * @param reactiveValue - The ReactiveValue instance to set
     */
    setReactiveValue(key: string, reactiveValue: ReactiveValue<any>): void {
        this._values.set(key, reactiveValue);
    }

    /**
     * Remove a reactive value by key and dispose it properly.
     * 
     * @param key - The key of the reactive value to remove
     * @returns True if the value existed and was removed
     */
    removeReactiveValue(key: string): boolean {
        const reactiveValue = this._values.get(key);
        if (reactiveValue) {
            reactiveValue.dispose();
            return this._values.delete(key);
        }
        return false;
    }

    /**
     * Get the count of reactive values in this context.
     */
    get reactiveValueCount(): number {
        return this._values.size;
    }
}
