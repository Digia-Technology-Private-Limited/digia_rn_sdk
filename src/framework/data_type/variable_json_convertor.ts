import { Variable } from './variable';

/**
 * Converter for serializing and deserializing Variable maps to/from JSON.
 * 
 * Handles conversion between Record<string, Variable> and JSON objects,
 * where each key maps to a Variable with its configuration.
 * 
 * @example
 * ```typescript
 * const converter = new VariableJsonConverter();
 * 
 * // From JSON
 * const variables = converter.fromJson({
 *   userName: { type: 'string', default: 'Guest' },
 *   count: { type: 'number', default: 0 }
 * });
 * 
 * // To JSON
 * const json = converter.toJson(variables);
 * ```
 */
export class VariableJsonConverter {
    /**
     * Convert a JSON object to a map of Variables.
     * 
     * Each key in the JSON becomes the variable name, and the value
     * contains the variable configuration (type, default value, etc.).
     * 
     * @param json - JSON object where keys are variable names and values are configurations
     * @returns A map of variable name to Variable instance
     * 
     * @example
     * ```typescript
     * const json = {
     *   email: { type: 'string', default: '' },
     *   age: { type: 'number', defaultValue: 18 },
     *   isActive: { type: 'boolean' }
     * };
     * 
     * const variables = converter.fromJson(json);
     * // {
     * //   email: Variable { name: 'email', type: DataType.String, defaultValue: '' },
     * //   age: Variable { name: 'age', type: DataType.Number, defaultValue: 18 },
     * //   isActive: Variable { name: 'isActive', type: DataType.Boolean }
     * // }
     * ```
     */
    fromJson(json?: Record<string, any> | null): Record<string, Variable> {
        if (!json) return {};

        const result: Record<string, Variable> = {};

        for (const [key, value] of Object.entries(json)) {
            // Merge the key as 'name' with the rest of the value object
            const variableJson =
                value && typeof value === 'object'
                    ? { name: key, ...value }
                    : { name: key };

            const variable = Variable.fromJson(variableJson);

            if (variable !== null) {
                result[key] = variable;
            }
        }

        return result;
    }

    /**
     * Convert a map of Variables to a JSON object.
     * 
     * Each Variable is serialized to its JSON representation,
     * with the key being the variable name.
     * 
     * @param object - Map of variable name to Variable instance
     * @returns A JSON object representation
     * 
     * @example
     * ```typescript
     * const variables = {
     *   email: new Variable({ name: 'email', type: DataType.String, defaultValue: '' }),
     *   age: new Variable({ name: 'age', type: DataType.Number, defaultValue: 18 })
     * };
     * 
     * const json = converter.toJson(variables);
     * // {
     * //   email: { type: 'string', name: 'email', default: '' },
     * //   age: { type: 'number', name: 'age', default: 18 }
     * // }
     * ```
     */
    toJson(object?: Record<string, Variable> | null): Record<string, any> {
        if (!object) return {};

        const result: Record<string, any> = {};

        for (const [key, variable] of Object.entries(object)) {
            result[key] = variable.toJson();
        }

        return result;
    }
}

/**
 * Singleton instance of VariableJsonConverter for convenience.
 */
export const variableJsonConverter = new VariableJsonConverter();

/**
 * Helper function to convert JSON to Variable map.
 * 
 * @param json - JSON object to convert
 * @returns Map of variable name to Variable instance
 */
export function variablesFromJson(
    json?: Record<string, any> | null
): Record<string, Variable> {
    return variableJsonConverter.fromJson(json);
}

/**
 * Helper function to convert Variable map to JSON.
 * 
 * @param variables - Map of variables to convert
 * @returns JSON object representation
 */
export function variablesToJson(
    variables?: Record<string, Variable> | null
): Record<string, any> {
    return variableJsonConverter.toJson(variables);
}
