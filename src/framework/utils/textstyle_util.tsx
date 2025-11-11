import React from 'react';
import { TextStyle, Text } from 'react-native';
import { ResourceContextValue } from '../resource_provider';
import { tryKeys, valueFor } from './json_util';
import { NumUtil } from './num_util';
import { JsonLike } from './types';
import { To } from './type_convertors';
import { as$ } from './functional_utils';
import { DUIFontFactory } from '../font_factory';

export const defaultTextStyle: TextStyle = {
    fontSize: 14,
    lineHeight: 21, // 14 * 1.5
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
};

interface EvalFunction {
    <T extends Object>(expr: any): T | null;
}

export const makeTextStyle = (
    json: JsonLike | null,
    resourceProvider: ResourceContextValue | null,
    evalFn: EvalFunction,
    fallback: TextStyle = defaultTextStyle
): TextStyle | null => {
    if (json == null) return null;

    const evalColor = (expr: any): string | undefined => {
        const colorString = evalFn<string>(expr);
        // If resourceProvider is available, resolve color through it
        if (!colorString) return undefined;
        return resourceProvider?.getColor?.(colorString) ?? colorString;
    };

    const textColor = evalColor(json['textColor']);
    const textBgColor = evalColor(tryKeys<string>(json, ['textBackgroundColor', 'textBgColor']));
    const textDecoration = To.textDecoration(json['textDecoration']);
    const textDecorationColor = evalColor(json['textDecorationColor']);
    const textDecorationStyle = To.textDecorationStyle(json['textDecorationStyle']);

    let fontToken = json['fontToken'];

    if (fontToken == null) {
        return {
            ...fallback,
            color: textColor ?? fallback.color,
            backgroundColor: textBgColor ?? fallback.backgroundColor,
            textDecorationLine: textDecoration ?? fallback.textDecorationLine,
            textDecorationColor: textDecorationColor ?? fallback.textDecorationColor,
            textDecorationStyle: textDecorationStyle ?? fallback.textDecorationStyle,
        };
    }

    if (typeof fontToken === 'string') {
        const textStyle = resourceProvider?.getFontFromToken?.(fontToken) ?? null;

        return {
            ...(textStyle || defaultTextStyle),
            color: textColor ?? undefined,
            backgroundColor: textBgColor ?? undefined,
            textDecorationLine: textDecoration ?? undefined,
            textDecorationColor: textDecorationColor ?? undefined,
            textDecorationStyle: textDecorationStyle ?? undefined,
        };
    }

    // This means json['fontToken'] is a map
    fontToken = fontToken as JsonLike;

    const fontTokenValue = as$<string>(fontToken['value']);
    const overridingFontFamily = valueFor(fontToken, 'font.fontFamily') as string | null;
    const overridingFontStyle = To.fontStyle(evalFn<string>(valueFor(fontToken, 'font.style')));
    const overridingFontWeight = To.fontWeight(evalFn<string>(valueFor(fontToken, 'font.weight')));
    const overridingFontSize = evalFn<number>(valueFor(fontToken, 'font.size'));
    const overridingFontHeight = evalFn<number>(valueFor(fontToken, 'font.height'));

    const fontFromToken = fontTokenValue
        ? resourceProvider?.getFontFromToken(fontTokenValue) ?? null
        : null;

    // Start from the resolved font (from token) or default and only apply
    // overrides when they are explicitly provided (not null/undefined).
    const baseStyle: TextStyle = (fontFromToken || defaultTextStyle) as TextStyle;
    const textStyle: TextStyle = { ...baseStyle };

    if (overridingFontWeight != null) textStyle.fontWeight = overridingFontWeight;
    if (overridingFontStyle != null) textStyle.fontStyle = overridingFontStyle;
    if (overridingFontSize != null) textStyle.fontSize = overridingFontSize;
    if (overridingFontHeight != null) textStyle.lineHeight = overridingFontHeight * (overridingFontSize || 14);
    if (textColor != null) textStyle.color = textColor;
    if (textBgColor != null) textStyle.backgroundColor = textBgColor;
    if (textDecoration != null) textStyle.textDecorationLine = textDecoration;
    if (textDecorationColor != null) textStyle.textDecorationColor = textDecorationColor;
    if (textDecorationStyle != null) textStyle.textDecorationStyle = textDecorationStyle;

    const fontFactory = resourceProvider?.getFontFactory() ?? undefined;

    if (overridingFontFamily == null || fontFactory == null) {
        return textStyle;
    }

    return fontFactory.getFont(overridingFontFamily, { textStyle });
};

export const convertToTextStyle = (
    value: any,
    fontFactory?: DUIFontFactory | null,
): TextStyle | null => {
    if (value == null || typeof value !== 'object') return null;

    const fontWeight = To.fontWeight(value['weight']);
    const fontStyle = To.fontStyle(value['style']);
    const fontSize = NumUtil.toDouble(value['size']) ?? 14;
    const fontHeight = NumUtil.toDouble(value['height']) ?? 1.5;
    // Below is done purposely. tryKeys doesn't check the type before casting.
    // Hence moved casting outside of tryKeys.
    const fontFamily = as$<string>(tryKeys(value, ['font-family', 'fontFamily']));

    if (fontFactory != null && fontFamily != null) {
        return fontFactory.getFont(
            fontFamily,
            {
                textStyle: {
                    fontWeight,
                    fontStyle,
                    fontSize,
                    lineHeight: fontSize * fontHeight,
                }
            }
        );
    }

    return {
        fontWeight,
        fontStyle,
        fontSize,
        lineHeight: fontSize * fontHeight,
    };
}; 