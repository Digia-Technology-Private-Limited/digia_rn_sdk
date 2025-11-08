import { to } from './object_util';

/**
 * Utility class for parsing and converting values to numeric types.
 * 
 * Provides safe conversion functions that handle various input types
 * and return null for invalid inputs instead of throwing errors.
 */
export class NumUtil {
    /**
     * Attempts to parse a dynamic input into a number (double/float).
     *
     * Handles the following cases:
     * - String representations of numbers, including hexadecimal
     * - Special string values 'inf' or 'infinity' (case-insensitive)
     * - Numeric types (number)
     *
     * @param input - The value to parse
     * @returns A valid number if parsing is successful, Infinity for 'inf'/'infinity', null otherwise
     * 
     * @example
     * ```typescript
     * NumUtil.toDouble('3.14');      // 3.14
     * NumUtil.toDouble('0xFF');      // 255
     * NumUtil.toDouble('infinity');  // Infinity
     * NumUtil.toDouble('invalid');   // null
     * ```
     */
    static toDouble(input: any): number | null {
        if (typeof input === 'string') {
            // Check for infinity representations
            const lowerInput = input.toLowerCase();
            if (lowerInput === 'inf' || lowerInput === 'infinity') {
                return Infinity;
            }

            // Handle hexadecimal strings
            if (input.startsWith('0x') || input.startsWith('0X')) {
                const hexValue = parseInt(input.substring(2), 16);
                return isNaN(hexValue) ? null : hexValue;
            }

            // Attempt to parse regular numeric strings
            const parsed = parseFloat(input);
            return isNaN(parsed) ? null : parsed;
        }

        // Handle numeric types
        if (typeof input === 'number') {
            return input;
        }

        // Return null for unsupported types
        return null;
    }

    /**
     * Attempts to parse a dynamic input into an integer.
     *
     * Handles the following cases:
     * - String representations of numbers, including hexadecimal
     * - Numeric types (truncates decimals)
     *
     * @param value - The value to parse
     * @returns A valid integer if parsing is successful, null otherwise
     * 
     * @example
     * ```typescript
     * NumUtil.toInt('42');      // 42
     * NumUtil.toInt('0xFF');    // 255
     * NumUtil.toInt(3.14);      // 3
     * NumUtil.toInt('invalid'); // null
     * ```
     */
    static toInt(value: any): number | null {
        if (typeof value === 'string') {
            // Handle hexadecimal strings
            const lowerValue = value.toLowerCase();
            if (lowerValue.startsWith('0x')) {
                const hexValue = parseInt(value.substring(2), 16);
                return isNaN(hexValue) ? null : hexValue;
            }

            // Attempt to parse regular numeric strings
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
        }

        // Handle numeric types (truncate decimals)
        if (typeof value === 'number') {
            return Math.trunc(value);
        }

        // Return null for unsupported types
        return null;
    }

    /**
     * Attempts to parse a dynamic input into a boolean value.
     *
     * Handles the following cases:
     * - Boolean values
     * - String representations of boolean values ('true'/'false', case-insensitive)
     * - Numbers (0 = false, non-zero = true)
     *
     * @param value - The value to parse
     * @returns A valid boolean if parsing is successful, null otherwise
     * 
     * @example
     * ```typescript
     * NumUtil.toBool(true);       // true
     * NumUtil.toBool('TRUE');     // true
     * NumUtil.toBool('false');    // false
     * NumUtil.toBool(1);          // true
     * NumUtil.toBool(0);          // false
     * NumUtil.toBool('invalid');  // null
     * ```
     */
    static toBool(value: any): boolean | null {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (lowerValue === 'true') {
                return true;
            }
            if (lowerValue === 'false') {
                return false;
            }
            return null;
        }

        if (typeof value === 'number') {
            return value !== 0;
        }

        return null;
    }

    /**
     * Attempts to parse a dynamic input into a number (int or double).
     *
     * Tries to parse as an integer first, then as a double/float.
     *
     * @param value - The value to parse
     * @returns A valid number if parsing is successful, null otherwise
     * 
     * @example
     * ```typescript
     * NumUtil.toNum('42');    // 42
     * NumUtil.toNum('3.14');  // 3.14
     * NumUtil.toNum({});      // null
     * ```
     */
    static toNum(value: any): number | null {
        return to<number>(value) ?? this.toInt(value) ?? this.toDouble(value);
    }
}
