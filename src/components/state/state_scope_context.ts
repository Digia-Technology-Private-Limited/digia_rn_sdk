import { DefaultScopeContext } from '../../framework/expr/default_scope_context';
import { StateContext } from './state_context';
import { ExprContext } from 'digia_expr';

/**
 * Scope context for component state management.
 * 
 * Extends DefaultScopeContext to provide access to StateContext values
 * with special handling for the 'state' key and state namespace lookups.
 * 
 * This context enables expressions to access component state variables
 * and integrates with the StateContext hierarchy for nested state management.
 * 
 * @example
 * ```typescript
 * const stateContext = new StateContext('myComponent', {
 *   initialState: { count: 0, name: 'John' }
 * });
 * 
 * const scopeContext = new StateScopeContext({
 *   stateContext,
 *   variables: { theme: 'dark' },
 * });
 * 
 * // Access state via 'state' key
 * const result = scopeContext.getValue('state');
 * // { found: true, value: { count: 0, name: 'John' } }
 * 
 * // Access state via namespace
 * const result2 = scopeContext.getValue('myComponent');
 * // { found: true, value: { count: 0, name: 'John' } }
 * 
 * // Access specific state variable
 * const count = scopeContext.getValue('count');
 * // { found: true, value: 0 }
 * 
 * // Access regular variable
 * const theme = scopeContext.getValue('theme');
 * // { found: true, value: 'dark' }
 * ```
 */
export class StateScopeContext extends DefaultScopeContext {
    private readonly _stateContext: StateContext;

    constructor(options: {
        stateContext: StateContext;
        variables?: Record<string, any>;
        enclosing?: ExprContext | null;
    }) {
        super({
            name: options.stateContext.namespace ?? '',
            variables: options.variables ?? {},
            enclosing: options.enclosing,
        });
        this._stateContext = options.stateContext;
    }

    /**
     * Retrieves a value from this context, with special handling for state access.
     * 
     * Lookup order:
     * 1. If key is 'state' or matches the namespace, returns all state variables
     * 2. If key exists in StateContext, returns that value
     * 3. Otherwise, delegates to parent context (variables and enclosing contexts)
     * 
     * @param key - The variable name to look up
     * @returns An object with `found` boolean and the `value`
     */
    override getValue(key: string): { found: boolean; value: any } {
        // Special case: 'state' key or namespace returns entire state object
        if (key === 'state' || key === this.name) {
            return {
                found: true,
                value: this._stateContext.stateVariables,
            };
        }

        // Check if key exists in state context
        if (this._stateContext.hasKey(key)) {
            return {
                found: true,
                value: this._stateContext.getValue(key),
            };
        }

        // Delegate to parent implementation (checks variables and enclosing)
        return super.getValue(key);
    }
}
