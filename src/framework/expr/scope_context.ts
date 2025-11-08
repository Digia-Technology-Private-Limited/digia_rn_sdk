import { ExprContext } from '@digia/expr-rn';

/**
 * Scope context for expression evaluation in the Digia UI SDK.
 * 
 * Extends the base ExprContext from @digia/expr-rn to provide additional
 * functionality for creating derived contexts with extended variables.
 * 
 * This is used throughout the SDK to provide expression evaluation contexts
 * that can access app state, component state, and other runtime values.
 * 
 * @example
 * ```typescript
 * class MyComponentContext extends ScopeContext {
 *   constructor(private vars: Record<string, any>) {
 *     super();
 *   }
 *   
 *   getValue(name: string): any {
 *     return this.vars[name];
 *   }
 *   
 *   copyAndExtend(newVariables: Record<string, any>): ScopeContext {
 *     return new MyComponentContext({ ...this.vars, ...newVariables });
 *   }
 * }
 * ```
 */
export abstract class ScopeContext extends ExprContext {
    /**
     * Creates a new context with additional variables.
     *
     * The new context should inherit all variables from this context,
     * and add or override with the provided newVariables.
     *
     * @param newVariables - A map of new or updated variables to add to the context
     * @returns A new ScopeContext instance with the combined variables
     * 
     * @example
     * ```typescript
     * const baseContext = new MyContext({ user: 'John', age: 30 });
     * const extendedContext = baseContext.copyAndExtend({ age: 31, city: 'NYC' });
     * // extendedContext has: { user: 'John', age: 31, city: 'NYC' }
     * ```
     */
    abstract copyAndExtend(newVariables: Record<string, any>): ScopeContext;
}
