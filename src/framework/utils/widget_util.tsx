import React from 'react';
import { View, TouchableOpacity, ViewStyle, DimensionValue } from 'react-native';
import { RenderPayload } from '../render_payload';
import { CommonStyle } from '../models/common_props';
import { ActionFlow } from '../actions/base/action_flow';
import { To } from './type_convertors';
import { as$ } from './functional_utils';
import { JsonLike } from './types';
import { NumUtil } from './num_util';

/**
 * Wraps a child component in a container with styling applied.
 * 
 * Applies padding, background color, borders, border radius, and sizing
 * based on the CommonStyle properties.
 * 
 * @param options - Configuration options
 * @returns Wrapped React component
 * 
 * @example
 * ```tsx
 * const wrapped = wrapInContainer({
 *   payload,
 *   style: commonStyle,
 *   child: <Text>Content</Text>
 * });
 * ```
 */
export function wrapInContainer(options: {
    payload: RenderPayload;
    style?: CommonStyle | null;
    child: React.ReactNode;
}): React.ReactElement {
    const { payload, style, child } = options;

    if (style == null) {
        return <>{child}</>;
    }

    const containerStyle: ViewStyle = {};

    // Apply padding
    const padding = To.edgeInsets(style.padding);
    if (typeof padding === 'object' && padding !== null) {
        Object.assign(containerStyle, padding);
    } else if (typeof padding === 'number') {
        containerStyle.padding = padding;
    }

    // Apply background color
    const bgColor = style.bgColor?.evaluate(payload.scopeContext);
    if (bgColor) {
        const color = payload.getColor(bgColor);
        if (color) {
            containerStyle.backgroundColor = color;
        }
    }

    // Apply border radius
    const borderRadius = To.borderRadius(style.borderRadius);
    if (typeof borderRadius === 'object' && borderRadius !== null) {
        Object.assign(containerStyle, borderRadius);
    } else if (typeof borderRadius === 'number') {
        containerStyle.borderRadius = borderRadius;
    }

    // Apply border
    const border = style.border;
    if (border) {
        const borderType = as$<JsonLike>(
            border['borderType'],
            (v): v is JsonLike => typeof v === 'object' && v !== null && !Array.isArray(v)
        );
        const borderColor = border['borderColor'];
        const borderWidth = NumUtil.toDouble(border['borderWidth']);
        const borderPattern = as$<string>(
            borderType?.['borderPattern'],
            (v): v is string => typeof v === 'string'
        );

        if (borderPattern === 'solid' && borderWidth != null && borderWidth > 0) {
            const color = payload.evalColor(borderColor);
            if (color) {
                containerStyle.borderColor = color;
                containerStyle.borderWidth = borderWidth;
                containerStyle.borderStyle = 'solid';
            }
        }
        // Note: React Native doesn't support dashed/dotted borders natively
        // For advanced border patterns, you'd need react-native-svg or similar
    }

    // Apply sizing
    const sizedStyle = _applySizing(containerStyle, style, payload);

    return (
        <View style={sizedStyle}>
            {child}
        </View>
    );
}

/**
 * Wraps a child component in a touchable component for handling actions.
 * 
 * Uses TouchableOpacity for touch feedback when actionFlow is present.
 * 
 * @param options - Configuration options
 * @returns Wrapped React component
 * 
 * @example
 * ```tsx
 * const wrapped = wrapInGestureDetector({
 *   payload,
 *   actionFlow,
 *   child: <Text>Click me</Text>
 * });
 * ```
 */
export function wrapInGestureDetector(options: {
    payload: RenderPayload;
    actionFlow?: ActionFlow | null;
    child: React.ReactNode;
    borderRadius?: number;
}): React.ReactElement {
    const { payload, actionFlow, child, borderRadius } = options;

    if (actionFlow == null || actionFlow.actions.length === 0) {
        return <>{child}</>;
    }

    const handlePress = () => {
        payload.executeAction(actionFlow, {
            triggerType: 'onTap',
        });
    };

    // In React Native, we use TouchableOpacity for feedback
    // inkwell property controls whether to show opacity feedback
    if (actionFlow.inkwell) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                style={borderRadius ? { borderRadius } : undefined}
            >
                {child}
            </TouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={1} // No visual feedback
            >
                {child}
            </TouchableOpacity>
        );
    }
}

/**
 * Wraps a child component with alignment.
 * 
 * @param options - Configuration options
 * @returns Wrapped React component
 * 
 * @example
 * ```tsx
 * const wrapped = wrapInAlign({
 *   value: 'center',
 *   child: <Text>Centered</Text>
 * });
 * ```
 */
export function wrapInAlign(options: {
    value?: any;
    child: React.ReactNode;
}): React.ReactElement {
    const { value, child } = options;

    const alignment = To.alignment(value);

    if (alignment == null) {
        return <>{child}</>;
    }

    return (
        <View style={alignment}>
            {child}
        </View>
    );
}

/**
 * Wraps a child component with aspect ratio constraint.
 * 
 * @param options - Configuration options
 * @returns Wrapped React component
 * 
 * @example
 * ```tsx
 * const wrapped = wrapInAspectRatio({
 *   value: 16/9,
 *   child: <Image source={...} />
 * });
 * ```
 */
export function wrapInAspectRatio(options: {
    value?: any;
    child: React.ReactNode;
}): React.ReactElement {
    const { value, child } = options;

    const aspectRatio = NumUtil.toDouble(value);

    if (aspectRatio == null) {
        return <>{child}</>;
    }

    return (
        <View style={{ aspectRatio }}>
            {child}
        </View>
    );
}

/**
 * Applies intrinsic and explicit sizing to a widget based on style properties.
 * 
 * Handles:
 * 1. Intrinsic sizing - when height/width is set to 'intrinsic'
 * 2. Explicit sizing - when height/width has specific values
 * 3. Mixed sizing - when one dimension is intrinsic and the other is explicit
 * 
 * Note: React Native doesn't have direct equivalent to Flutter's IntrinsicWidth/Height.
 * Intrinsic sizing is handled by the layout system automatically in most cases.
 */
function _applySizing(
    currentStyle: ViewStyle,
    style: CommonStyle,
    payload: RenderPayload
): ViewStyle {
    const isHeightIntrinsic = _isIntrinsic(style.height);
    const isWidthIntrinsic = _isIntrinsic(style.width);

    const sizedStyle: ViewStyle = { ...currentStyle };

    // Apply explicit sizing for non-intrinsic dimensions
    if (!isHeightIntrinsic && style.height != null) {
        const height = _toDimensionValue(style.height);
        if (height != null) {
            sizedStyle.height = height;
        }
    }

    if (!isWidthIntrinsic && style.width != null) {
        const width = _toDimensionValue(style.width);
        if (width != null) {
            sizedStyle.width = width;
        }
    }

    // For intrinsic sizing in React Native:
    // - Leave width/height undefined to allow content to determine size
    // - The flex layout system handles this automatically
    if (isHeightIntrinsic) {
        // Height will be determined by content
        sizedStyle.height = undefined;
    }

    if (isWidthIntrinsic) {
        // Width will be determined by content
        sizedStyle.width = undefined;
    }

    return sizedStyle;
}

/**
 * Checks if a dimension value represents intrinsic sizing.
 */
function _isIntrinsic(dimensionValue?: DimensionValue | string): boolean {
    if (dimensionValue == null) return false;

    if (typeof dimensionValue === 'string') {
        return dimensionValue.trim().toLowerCase() === 'intrinsic';
    }

    return false;
}

/**
 * Converts a dimension value to React Native DimensionValue.
 */
function _toDimensionValue(value: any): DimensionValue | undefined {
    if (value == null) return undefined;

    // Handle percentage strings
    if (typeof value === 'string') {
        if (value.endsWith('%')) {
            return value as DimensionValue;
        }
        // Try to parse as number
        const num = NumUtil.toDouble(value);
        return num ?? undefined;
    }

    // Handle numbers
    if (typeof value === 'number') {
        return value;
    }

    return undefined;
}
