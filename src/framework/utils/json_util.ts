import { Logger } from '../../utils/logger';
import { JsonLike } from './types';

/**
 * Type for JSON reviver function.
 * A function that can transform decoded JSON values.
 */
export type JsonReviver = (key: any, value: any) => any;

/**
 * Attempts to decode a JSON string, returning null if decoding fails.
 * 
 * This function provides a safe way to decode JSON without throwing exceptions.
 * Errors are logged in development mode.
 * 
 * @param source - The JSON string to decode
 * @param reviver - Optional function to transform decoded values
 * @returns The decoded JSON object, or null if decoding fails
 * 
 * @example
 * ```typescript
 * const obj = tryJsonDecode('{"name":"John"}');
 * // Returns: { name: "John" }
 * 
 * const invalid = tryJsonDecode('invalid json');
 * // Returns: null (and logs error in dev mode)
 * ```
 */
export function tryJsonDecode(source: string, reviver?: JsonReviver): any {
    try {
        return JSON.parse(source, reviver);
    } catch (e) {
        Logger.error(
            `JSON decode error: ${e}`,
            'JsonUtil',
            e instanceof Error ? e : new Error(String(e))
        );
        return null;
    }
}

/**
 * Attempts to retrieve a value from a JSON object using multiple possible keys.
 * 
 * Searches for the first matching key in the provided list and returns its value.
 * Optionally applies a parse/transform function to the found value.
 * 
 * @template T - The expected return type
 * @param json - The JSON object to search in
 * @param keys - An ordered list of keys to try
 * @param parse - Optional function to cast or transform the value if found
 * @returns The value associated with the first matching key, or null if no key is found
 * 
 * @example
 * ```typescript
 * const data = { firstName: 'John', age: 30 };
 * 
 * // Try multiple key variations
 * const name = tryKeys<string>(data, ['name', 'firstName', 'first_name']);
 * // Returns: 'John'
 * 
 * // With parse function
 * const ageStr = tryKeys<string>(data, ['age'], {
 *   parse: (val) => val?.toString()
 * });
 * // Returns: '30'
 * ```
 */
export function tryKeys<T = any>(
    json: JsonLike,
    keys: string[],
    options?: {
        parse?: (value: any) => T | null | undefined;
    }
): T | null {
    for (const key of keys) {
        if (key in json) {
            const value = json[key];
            return options?.parse ? (options.parse(value) ?? null) : (value as T);
        }
    }
    return null;
}

/**
 * Retrieves the value for a given key path in a nested object.
 * 
 * The key path is a dot-separated string representing the path to the desired value.
 * For example, 'a.b.c' will retrieve the value at obj['a']['b']['c'].
 * 
 * @param json - The JSON object to search in
 * @param keyPath - Dot-separated path to the value (e.g., 'user.address.city')
 * @returns The value at the key path, or null if not found
 * 
 * @example
 * ```typescript
 * const data = {
 *   user: {
 *     name: 'John',
 *     address: {
 *       city: 'New York'
 *     }
 *   }
 * };
 * 
 * const city = valueFor(data, 'user.address.city');
 * // Returns: 'New York'
 * 
 * const missing = valueFor(data, 'user.phone.number');
 * // Returns: null
 * ```
 */
export function valueFor(json: JsonLike, keyPath: string): any {
    // Split the keyPath into individual keys
    const keysSplit = keyPath.split('.');

    // Get the first key
    const thisKey = keysSplit[0];

    // Get the value associated with the first key
    const thisValue = json[thisKey];

    // If there are no more keys, return the current value
    if (keysSplit.length === 1) {
        return thisValue;
    }

    // If the current value is an object, recursively call valueFor on the remaining key path
    if (thisValue && typeof thisValue === 'object' && !Array.isArray(thisValue)) {
        return valueFor(thisValue as JsonLike, keysSplit.slice(1).join('.'));
    }

    // If the current value is not an object and there are still keys left, return null
    return null;
}

/**
 * Sets the value for a given key path in a nested object.
 * 
 * The key path is a dot-separated string representing the path to the desired value.
 * For example, 'a.b.c' will set the value at obj['a']['b']['c'].
 * If intermediate objects do not exist, they will be created.
 * 
 * @param json - The JSON object to modify
 * @param keyPath - Dot-separated path to the value (e.g., 'user.address.city')
 * @param value - The value to set
 * 
 * @example
 * ```typescript
 * const data = {};
 * 
 * setValueFor(data, 'user.name', 'John');
 * // data is now: { user: { name: 'John' } }
 * 
 * setValueFor(data, 'user.address.city', 'New York');
 * // data is now: { user: { name: 'John', address: { city: 'New York' } } }
 * ```
 */
export function setValueFor(json: JsonLike, keyPath: string, value: any): void {
    // Split the keyPath into individual keys
    const keysSplit = keyPath.split('.');

    // Get the first key
    const thisKey = keysSplit[0];

    // If there are no more keys, set the value at the current key
    if (keysSplit.length === 1) {
        json[thisKey] = value;
        return;
    }

    // If the current value is not an object, create a new object
    if (!json[thisKey] || typeof json[thisKey] !== 'object' || Array.isArray(json[thisKey])) {
        json[thisKey] = {};
    }

    // Recursively call setValueFor on the remaining key path
    setValueFor(json[thisKey] as JsonLike, keysSplit.slice(1).join('.'), value);
}

/**
 * Helper functions for working with JSON-like objects.
 */
export const JsonUtil = {
    tryDecode: tryJsonDecode,
    tryKeys,
    valueFor,
    setValueFor,

    /**
     * Deep clone a JSON-like object.
     */
    deepClone<T = any>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if a value is a valid JSON object.
     */
    isJsonLike(value: any): value is JsonLike {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    },

    /**
     * Safely get a nested value with a default fallback.
     */
    get<T = any>(json: JsonLike, keyPath: string, defaultValue?: T): T | null {
        const value = valueFor(json, keyPath);
        return value !== null && value !== undefined ? value : (defaultValue ?? null);
    },

    /**
     * Check if a key path exists in the object.
     */
    has(json: JsonLike, keyPath: string): boolean {
        return valueFor(json, keyPath) !== null;
    },
};
