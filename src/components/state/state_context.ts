import { EventEmitter } from 'events';

/**
 * Manages state for a specific namespace and provides access to enclosing contexts.
 * 
 * React Native equivalent of Flutter's ChangeNotifier-based StateContext.
 * Uses EventEmitter for change notifications similar to Flutter's notifyListeners().
 * 
 * @example
 * ```typescript
 * const parentContext = new StateContext('parent', {
 *   initialState: { theme: 'dark' }
 * });
 * 
 * const childContext = new StateContext('child', {
 *   initialState: { count: 0 },
 *   ancestorContext: parentContext
 * });
 * 
 * // Listen for changes
 * childContext.on('change', () => {
 *   console.log('State changed!');
 * });
 * 
 * // Update state
 * childContext.setValue('count', 5); // Triggers 'change' event
 * 
 * // Access parent state
 * const theme = childContext.getValue('theme'); // 'dark'
 * ```
 */
export class StateContext extends EventEmitter {
    /** The unique identifier for this state context. */
    readonly namespace?: string;

    /** Unique ID for this state context instance. */
    readonly stateId?: string;

    /** The state variables stored in this context. */
    private readonly _stateVariables: Map<string, any>;

    /** The parent context, if any. */
    private readonly _ancestorContext?: StateContext;

    constructor(
        namespace?: string,
        options?: {
            stateId?: string;
            initialState?: Record<string, any>;
            ancestorContext?: StateContext;
        }
    ) {
        super();
        this.namespace = namespace;
        this.stateId = options?.stateId;
        this._stateVariables = new Map(Object.entries(options?.initialState ?? {}));
        this._ancestorContext = options?.ancestorContext;
    }

    /**
     * Traverses the StateContext hierarchy to find the Origin context.
     *
     * This context typically belongs to the root Page or Component.
     * It's useful for accessing global state or performing actions
     * that affect the entire state tree.
     */
    get originContext(): StateContext {
        let current: StateContext = this;
        while (current._ancestorContext != null) {
            current = current._ancestorContext;
        }
        return current;
    }

    /**
     * Retrieves a value from the state, searching up the context hierarchy if necessary.
     * 
     * @param key - The key of the value to retrieve
     * @returns The value associated with the key, or undefined if not found
     */
    getValue(key: string): any {
        if (this._stateVariables.has(key)) {
            return this._stateVariables.get(key);
        }
        return this._ancestorContext?.getValue(key);
    }

    /**
     * Finds an ancestor context with the specified namespace.
     * 
     * @param targetNamespace - The namespace to search for
     * @returns The ancestor context with the matching namespace, or undefined
     */
    findAncestorContext(targetNamespace: string): StateContext | undefined {
        if (this.namespace === targetNamespace) return this;
        return this._ancestorContext?.findAncestorContext(targetNamespace);
    }

    /**
     * Updates a value in the state, notifying listeners if specified.
     *
     * @param key - The key of the value to update
     * @param value - The new value
     * @param notify - Whether to notify listeners (default: true)
     * @returns true if the update was successful, false otherwise
     */
    setValue(key: string, value: any, options?: { notify?: boolean }): boolean {
        const notify = options?.notify ?? true;

        if (this._stateVariables.has(key)) {
            this._stateVariables.set(key, value);
            if (notify) this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * Updates multiple values in the state, notifying listeners once if specified.
     *
     * @param updates - Map of key-value pairs to update
     * @param notify - Whether to notify listeners (default: true)
     * @returns A map of keys to boolean values indicating whether each update was successful
     */
    setValues(
        updates: Record<string, any>,
        options?: { notify?: boolean }
    ): Record<string, boolean> {
        const notify = options?.notify ?? true;
        const results: Record<string, boolean> = {};
        let anyUpdated = false;

        for (const [key, value] of Object.entries(updates)) {
            if (this.hasKey(key)) {
                this._stateVariables.set(key, value);
                results[key] = true;
                anyUpdated = true;
            } else {
                results[key] = false;
            }
        }

        if (notify && anyUpdated) {
            this.notifyListeners();
        }

        return results;
    }

    /**
     * Notifies all listeners that the state has changed, triggering a rebuild.
     * 
     * Emits a 'change' event that listeners can subscribe to.
     */
    notifyListeners(): void {
        this.emit('change');
    }

    /**
     * Notifies all listeners that the state has changed, triggering a rebuild.
     * 
     * Alias for notifyListeners() to match Flutter API.
     */
    triggerListeners(): void {
        this.notifyListeners();
    }

    /**
     * Checks if a key exists in the current context (not including parent contexts).
     * 
     * @param key - The key to check
     * @returns true if the key exists in this context, false otherwise
     */
    hasKey(key: string): boolean {
        return this._stateVariables.has(key);
    }

    /**
     * Returns a read-only view of the state variables.
     * 
     * @returns An object containing all state variables in this context
     */
    get stateVariables(): Record<string, any> {
        return Object.fromEntries(this._stateVariables);
    }
}
