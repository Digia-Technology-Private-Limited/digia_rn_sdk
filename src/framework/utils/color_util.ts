/**
 * Utility class for parsing and converting color values.
 * 
 * Supports multiple color formats:
 * - Hex strings: "#RGB", "#RRGGBB", "#RRGGBBAA"
 * - RGBA strings: "255,0,0" or "255,0,0,0.5"
 */
export class ColorUtil {
    /**
     * Regular expression pattern to validate hex color strings.
     *
     * The pattern checks for valid hex color strings in the following formats:
     * - "#RGB" or "#RRGGBB" (with or without the leading "#").
     * - "#RGBA" or "#RRGGBBAA" (with or without the leading "#").
     *
     * The `R`, `G`, `B`, and `A` represent hexadecimal digits (0-9, A-F, a-f) that
     * define the red, green, blue, and alpha components of the color, respectively.
     */
    static readonly hexColorPattern = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

    /**
     * Checks if a given hex color string is a valid color value.
     *
     * @param hex - The hex color string to validate
     * @returns True if the hex string is a valid color value
     * 
     * @example
     * ```typescript
     * ColorUtil.isValidColorHex("#FF0000");     // true
     * ColorUtil.isValidColorHex("00FF00");      // true
     * ColorUtil.isValidColorHex("#12345F80");   // true
     * ColorUtil.isValidColorHex("invalid");     // false
     * ```
     */
    static isValidColorHex(hex: string): boolean {
        return this.hexColorPattern.test(hex);
    }

    /**
     * Converts the given hex color string to the corresponding integer.
     *
     * Note that when no alpha/opacity is specified, 0xFF is assumed.
     *
     * @param hex - The hex color string
     * @returns Integer representation of the color
     */
    static hexToInt(hex: string): number {
        const hexDigits = hex.startsWith('#') ? hex.substring(1) : hex;
        const hexMask = hexDigits.length <= 6 ? 0xff000000 : 0;
        const hexValue = parseInt(hexDigits, 16);

        if (hexValue < 0 || hexValue > 0xffffffff) {
            throw new Error(`Invalid hex color value: ${hex}`);
        }

        return hexValue | hexMask;
    }

    /**
     * Converts the given hex color string to a React Native color string.
     *
     * @param hex - The hex color string
     * @returns Color string in "#RRGGBB" or "#RRGGBBAA" format
     * 
     * @example
     * ```typescript
     * ColorUtil.fromHexString("#FF0000");      // "#FF0000"
     * ColorUtil.fromHexString("00FF00");       // "#00FF00"
     * ColorUtil.fromHexString("#12345F80");    // "#12345F80"
     * ```
     */
    static fromHexString(hex: string): string {
        const hexIntValue = this.hexToInt(hex);
        return this.intToHex(hexIntValue, { includeAlpha: hex.length > 7 });
    }

    /**
     * Tries to convert a hex string to color, returns null if invalid.
     *
     * @param hex - The hex color string
     * @returns Color string or null if parsing fails
     */
    static tryFromHexString(hex: string): string | null {
        try {
            return this.fromHexString(hex);
        } catch (e) {
            return null;
        }
    }

    /**
     * Tries to create a color from comma-separated red, green, blue, and opacity values.
     *
     * Format: "R,G,B" or "R,G,B,A"
     * - R, G, B: 0-255
     * - A (optional): 0.0-1.0 (double) or 0-255 (hex)
     *
     * @param rgba - The RGBA string
     * @returns Color string in "rgba(R, G, B, A)" format
     * 
     * @example
     * ```typescript
     * ColorUtil.fromRgbaString("255,0,0");        // "rgba(255, 0, 0, 1)"
     * ColorUtil.fromRgbaString("0,255,0,0.5");    // "rgba(0, 255, 0, 0.5)"
     * ColorUtil.fromRgbaString("0,0,255,128");    // "rgba(0, 0, 255, 0.5)"
     * ```
     */
    static fromRgbaString(rgba: string): string {
        const components = rgba.split(',');

        if (components.length < 3) {
            throw new Error('Invalid RGBA format');
        }

        // Extract R, G, B and clamp to valid range
        const r = Math.max(0, Math.min(255, parseInt(components[0].trim(), 10)));
        const g = Math.max(0, Math.min(255, parseInt(components[1].trim(), 10)));
        const b = Math.max(0, Math.min(255, parseInt(components[2].trim(), 10)));

        let a = 1.0;
        if (components.length === 4) {
            const alphaStr = components[3].trim();
            const alpha0_255 = parseInt(alphaStr, 10);

            if (!isNaN(alpha0_255)) {
                // Integer format (0-255)
                a = Math.max(0, Math.min(255, alpha0_255)) / 255.0;
            } else {
                // Double format (0.0-1.0)
                const alphaDouble = parseFloat(alphaStr);
                a = !isNaN(alphaDouble) ? Math.max(0, Math.min(1, alphaDouble)) : 1.0;
            }
        }

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    /**
     * Tries to convert an RGBA string to color, returns null if invalid.
     *
     * @param rgba - The RGBA string
     * @returns Color string or null if parsing fails
     */
    static tryFromRgbaString(rgba: string): string | null {
        try {
            return this.fromRgbaString(rgba);
        } catch (e) {
            return null;
        }
    }

    /**
     * Tries to convert a string value to a color.
     *
     * Attempts to parse as hex first, then as RGBA.
     *
     * @param value - The color string
     * @returns Color string or null if parsing fails
     * 
     * @example
     * ```typescript
     * ColorUtil.fromString("#FF0000");        // "#FF0000"
     * ColorUtil.fromString("255,0,0");        // "rgba(255, 0, 0, 1)"
     * ColorUtil.fromString("invalid");        // null
     * ColorUtil.fromString(null);             // null
     * ```
     */
    static fromString(value?: string | null): string | null {
        if (value == null || value.length === 0) {
            return null;
        }

        return this.tryFromHexString(value) ?? this.tryFromRgbaString(value);
    }

    /**
     * Converts a string value to a color with fallback.
     *
     * @param value - The color string
     * @param defaultColor - Fallback color if parsing fails (default: "transparent")
     * @returns Color string
     */
    static fromStringOrDefault(
        value: string,
        defaultColor: string = 'transparent'
    ): string {
        return this.fromString(value) ?? defaultColor;
    }

    /**
     * Converts an integer color value to hex string.
     *
     * @param i - Integer color value
     * @param options - Conversion options
     * @returns Hex string with leading #
     * 
     * @example
     * ```typescript
     * ColorUtil.intToHex(0xFF0000FF);                        // "#FF0000"
     * ColorUtil.intToHex(0x80FF0000, { includeAlpha: true }); // "#80FF0000"
     * ```
     */
    static intToHex(
        i: number,
        options?: {
            includeAlpha?: boolean;
            skipAlphaIfOpaque?: boolean;
        }
    ): string {
        if (i < 0 || i > 0xffffffff) {
            throw new Error(`Invalid color integer: ${i}`);
        }

        const a = (i >>> 24) & 0xff;
        const r = (i >>> 16) & 0xff;
        const g = (i >>> 8) & 0xff;
        const b = i & 0xff;

        const includeAlpha = options?.includeAlpha ?? false;
        const skipAlphaIfOpaque = options?.skipAlphaIfOpaque ?? true;

        let hex = '#';

        if (includeAlpha && !(skipAlphaIfOpaque && a === 0xff)) {
            hex += this._padRadix(a);
        }

        hex += this._padRadix(r);
        hex += this._padRadix(g);
        hex += this._padRadix(b);

        return hex.toUpperCase();
    }

    /**
     * Fills up a 3-character hex string to 6 characters.
     *
     * @param hex - The hex color string
     * @returns Expanded hex string
     * 
     * @example
     * ```typescript
     * ColorUtil.fillUpHex("#F00");    // "#FF0000"
     * ColorUtil.fillUpHex("ABC");     // "#AABBCC"
     * ```
     */
    static fillUpHex(hex: string): string {
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }

        if (hex.length === 7) {
            return hex;
        }

        let filledUp = '';
        for (const char of hex) {
            if (char === '#') {
                filledUp += char;
            } else {
                filledUp += char + char;
            }
        }
        return filledUp;
    }

    /**
     * Generates a random color with specified opacity.
     *
     * @param opacity - Alpha value from 0.0 to 1.0 (default: 0.3)
     * @returns Random color string
     * 
     * @example
     * ```typescript
     * ColorUtil.randomColor();         // Random color with 0.3 opacity
     * ColorUtil.randomColor(1.0);      // Random opaque color
     * ```
     */
    static randomColor(opacity: number = 0.3): string {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = Math.max(0, Math.min(1, opacity));

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    /**
     * Pads a number to 2-digit hex string.
     * @private
     */
    private static _padRadix(value: number): string {
        return value.toString(16).padStart(2, '0');
    }
}
