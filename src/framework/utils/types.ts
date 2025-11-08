/**
 * Common type definitions used throughout the framework.
 */

/**
 * Represents a JSON-like map structure with string keys and potentially null values.
 * 
 * This is a Record type that can hold any JSON-serializable values including null.
 * It's commonly used for configuration objects, API responses, and dynamic data structures.
 * 
 * @example
 * ```typescript
 * const config: JsonLike = {
 *   name: 'John',
 *   age: 30,
 *   email: null,
 *   settings: {
 *     theme: 'dark',
 *     notifications: true
 *   }
 * };
 * ```
 */
export type JsonLike = Record<string, any>;

/**
 * Type guard to check if a value is a JsonLike object.
 */
export function isJsonLike(value: unknown): value is JsonLike {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type for primitive JSON values.
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Type for any valid JSON value.
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Type for JSON objects.
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * Type for JSON arrays.
 */
export type JsonArray = JsonValue[];
