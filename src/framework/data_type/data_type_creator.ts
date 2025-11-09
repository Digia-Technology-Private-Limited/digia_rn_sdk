import { DataType } from './data_type';
import { Variable } from './variable';
import { ScopeContext } from '../expr/scope_context';

/**
 * Utility for creating default values from Variable definitions.
 * 
 * This class resolves Variable definitions to their actual default values
 * based on the variable's type and defaultValue property. Used primarily
 * for initializing state containers and component instances.
 * 
 * @example
 * ```typescript
 * const variable = new Variable({
 *   name: 'counter',
 *   type: DataType.Number,
 *   defaultValue: 0
 * });
 * 
 * const value = DataTypeCreator.create(variable, scopeContext);
 * // value = 0
 * 
 * const listVar = new Variable({
 *   name: 'items',
 *   type: DataType.List
 * });
 * 
 * const listValue = DataTypeCreator.create(listVar, scopeContext);
 * // listValue = []
 * ```
 */
export class DataTypeCreator {
    /**
     * Create a default value from a Variable definition.
     * 
     * If the variable has a defaultValue, that value is returned.
     * Otherwise, returns a type-appropriate default value:
     * - String: ''
     * - Number: 0
     * - Boolean: false
     * - List: []
     * - Map: {}
     * - Any/Null: null
     * 
     * @param variable - The variable definition
     * @param scopeContext - Optional scope context for expression evaluation (currently unused, for future use)
     * @returns The default value for this variable
     * 
     * @example
     * ```typescript
     * // With default value
     * const nameVar = new Variable({ name: 'name', type: DataType.String, defaultValue: 'Guest' });
     * DataTypeCreator.create(nameVar); // 'Guest'
     * 
     * // Without default value
     * const countVar = new Variable({ name: 'count', type: DataType.Number });
     * DataTypeCreator.create(countVar); // 0
     * 
     * const flagVar = new Variable({ name: 'flag', type: DataType.Boolean });
     * DataTypeCreator.create(flagVar); // false
     * ```
     */
    static create(variable: Variable, scopeContext?: ScopeContext): any {
        // If variable has a default value, use it
        if (variable.defaultValue !== undefined) {
            return variable.defaultValue;
        }

        // Otherwise, return type-specific default
        switch (variable.type) {
            case DataType.String:
                return '';
            case DataType.Number:
                return 0;
            case DataType.Boolean:
                return false;
            case DataType.JsonArray:
                return [];
            case DataType.Json:
                return {};
            default:
                return null;
        }
    }

    /**
     * Create default values for multiple variables.
     * 
     * @param variables - Map of variable name to Variable definition
     * @param scopeContext - Optional scope context for expression evaluation
     * @returns Record of variable name to default value
     * 
     * @example
     * ```typescript
     * const variables = {
     *   name: new Variable({ name: 'name', type: DataType.String }),
     *   age: new Variable({ name: 'age', type: DataType.Number, defaultValue: 18 }),
     *   active: new Variable({ name: 'active', type: DataType.Boolean })
     * };
     * 
     * const values = DataTypeCreator.createMany(variables);
     * // { name: '', age: 18, active: false }
     * ```
     */
    static createMany(
        variables: Record<string, Variable>,
        scopeContext?: ScopeContext
    ): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [name, variable] of Object.entries(variables)) {
            result[name] = DataTypeCreator.create(variable, scopeContext);
        }

        return result;
    }
}
