import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// React Native doesn't have exact equivalents for EdgeInsets and BorderRadius,
// but we can create similar utilities for style objects
export class StyleGeometryExtensions {
    static isPaddingZero(padding: number | object | undefined): boolean {
        if (padding === undefined || padding === 0) return true;
        if (typeof padding === 'number') return padding === 0;

        // Handle object style padding {top, right, bottom, left}
        const padObj = padding as any;
        return (
            (padObj.top === undefined || padObj.top === 0) &&
            (padObj.right === undefined || padObj.right === 0) &&
            (padObj.bottom === undefined || padObj.bottom === 0) &&
            (padObj.left === undefined || padObj.left === 0)
        );
    }

    static isBorderRadiusZero(borderRadius: number | object | undefined): boolean {
        if (borderRadius === undefined || borderRadius === 0) return true;
        if (typeof borderRadius === 'number') return borderRadius === 0;

        // Handle object style borderRadius
        const radiusObj = borderRadius as any;
        return (
            (radiusObj.borderRadius === undefined || radiusObj.borderRadius === 0) &&
            (radiusObj.borderTopLeftRadius === undefined || radiusObj.borderTopLeftRadius === 0) &&
            (radiusObj.borderTopRightRadius === undefined || radiusObj.borderTopRightRadius === 0) &&
            (radiusObj.borderBottomLeftRadius === undefined || radiusObj.borderBottomLeftRadius === 0) &&
            (radiusObj.borderBottomRightRadius === undefined || radiusObj.borderBottomRightRadius === 0)
        );
    }
}

// Main extent utility class for string conversion
export class ExtentUtil {
    private static screenDimensions: ScaledSize = Dimensions.get('window');

    /**
     * Updates screen dimensions (call this on orientation change)
     */
    static updateScreenDimensions(): void {
        this.screenDimensions = Dimensions.get('window');
    }

    /**
     * Converts the string to a height value based on the screen height.
     * Supports percentage (e.g., "50%") and absolute (e.g., "100.5") values.
     * Returns null if the string is invalid or empty.
     */
    static toHeight(value: string): number | null {
        return this._computeExtent(value, () => this.screenDimensions.height);
    }

    /**
     * Converts the string to a width value based on the screen width.
     * Supports percentage (e.g., "50%") and absolute (e.g., "100.5") values.
     * Returns null if the string is invalid or empty.
     */
    static toWidth(value: string): number | null {
        return this._computeExtent(value, () => this.screenDimensions.width);
    }

    /**
     * Computes the actual extent based on the given total extent and the string value.
     * Returns null for invalid input.
     */
    private static _computeExtent(
        value: string,
        getExtent: () => number
    ): number | null {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) return null;

        if (trimmedValue.endsWith('%')) {
            const totalExtent = getExtent();
            return this._handlePercentage(totalExtent, trimmedValue);
        }

        return this._parseNumber(trimmedValue);
    }

    /**
     * Handles percentage values, converting them to actual extent.
     * Returns null if the percentage value is invalid.
     */
    private static _handlePercentage(totalExtent: number, percentageValue: string): number | null {
        const percentageString = percentageValue.substring(0, percentageValue.length - 1);
        const percentage = this._parseNumber(percentageString);
        if (percentage === null) return null;

        return totalExtent * (percentage / 100);
    }

    /**
     * Parses a number string, handling both integer and decimal values.
     */
    private static _parseNumber(value: string): number | null {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
}

// String extension methods (TypeScript doesn't have real extensions, but we can use a wrapper)
export class StringExtentExtensions {
    /**
     * Converts the string to a height value based on the screen height.
     * Returns null if the string is invalid or empty.
     */
    static toHeight(value: string): number | null {
        return ExtentUtil.toHeight(value);
    }

    /**
     * Converts the string to a width value based on the screen width.
     * Returns null if the string is invalid or empty.
     */
    static toWidth(value: string): number | null {
        return ExtentUtil.toWidth(value);
    }
}

// Hook for responsive dimensions
export const useResponsiveDimensions = () => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
            ExtentUtil.updateScreenDimensions();
        });

        return () => subscription?.remove();
    }, []);

    return {
        screenWidth: dimensions.width,
        screenHeight: dimensions.height,
        toHeight: (value: string): number | null => ExtentUtil.toHeight(value),
        toWidth: (value: string): number | null => ExtentUtil.toWidth(value),
    };
};
