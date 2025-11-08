import { ExprContext } from '@digia/expr-rn';
import { ScopeContext } from './scope_context';

/**
 * A basic implementation of ScopeContext that can be used as-is or extended.
 * 
 * Provides a simple variable storage mechanism with support for enclosing
 * (parent) contexts, enabling scope chaining for expression evaluation.
 * 
 * @example
 * ```typescript
 * // Create a basic context
 * const context = new DefaultScopeContext({
 *   variables: { user: 'John', age: 30 }
 * });
 * 
 * // Create a child context with additional variables
 * const childContext = new DefaultScopeContext({
 *   variables: { city: 'NYC' },
 *   enclosing: context
 * });
 * 
 * // Child can access parent variables
 * childContext.getValue('user'); // { found: true, value: 'John' }
 * childContext.getValue('city'); // { found: true, value: 'NYC' }
 * ```
 */
export class DefaultScopeContext extends ScopeContext {
    /** Name of this context (for debugging) */
    public readonly name: string;

    /** Parent/enclosing context */
    private _enclosing: ExprContext | null;

    /** Variables stored in this context */
    private readonly _variables: Map<string, any>;

    constructor(options: {
        /** Optional name for this context */
        name?: string;
        /** Variables to store in this context */
        variables: Record<string, any>;
        /** Optional parent/enclosing context */
        enclosing?: ExprContext | null;
    }) {
        super();
        this.name = options.name || '';
        this._variables = new Map(Object.entries(options.variables));
        this._enclosing = options.enclosing ?? null;
    }

    /**
     * Sets the enclosing (parent) context.
     */
    set enclosing(context: ExprContext | null) {
        this._enclosing = context;
    }

    /**
     * Gets the enclosing (parent) context.
     */
    get enclosing(): ExprContext | null {
        return this._enclosing;
    }

    /**
     * Retrieves a value by key from this context or parent contexts.
     * 
     * @param key - The variable name to look up
     * @returns An object with `found` boolean and the `value`
     * 
     * @example
     * ```typescript
     * const result = context.getValue('user');
     * if (result.found) {
     *   console.log('User:', result.value);
     * }
     * ```
     */
    getValue(key: string): { found: boolean; value: any } {
        if (this._variables.has(key)) {
            return {
                found: true,
                value: this._variables.get(key),
            };
        }

        // Check enclosing context
        if (this._enclosing) {
            return this._enclosing.getValue(key);
        }

        return { found: false, value: null };
    }

    /**
     * Creates a new context with additional variables.
     * 
     * The new context inherits all variables from this context and adds/overrides
     * with the provided newVariables.
     * 
     * @param newVariables - A map of new or updated variables
     * @returns A new DefaultScopeContext with combined variables
     * 
     * @example
     * ```typescript
     * const base = new DefaultScopeContext({
     *   variables: { a: 1, b: 2 }
     * });
     * const extended = base.copyAndExtend({ b: 3, c: 4 });
     * // extended has: { a: 1, b: 3, c: 4 }
     * ```
     */
    copyAndExtend(newVariables: Record<string, any>): ScopeContext {
        // Merge current variables with new ones
        const mergedVariables: Record<string, any> = {};

        // Copy existing variables
        this._variables.forEach((value, key) => {
            mergedVariables[key] = value;
        });

        // Add/override with new variables
        Object.assign(mergedVariables, newVariables);

        return new DefaultScopeContext({
            name: this.name,
            variables: mergedVariables,
            enclosing: this._enclosing,
        });
    }
}
