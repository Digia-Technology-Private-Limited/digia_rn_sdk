import { TextStyle } from 'react-native';

/**
 * Abstract factory for creating font styles in the Digia UI SDK.
 * 
 * Implementations of this interface provide font configurations
 * for the application, allowing customization of typography.
 */
export abstract class DUIFontFactory {
    /**
     * Get a TextStyle for the specified font family with optional style properties.
     * 
     * @param fontFamily - The name of the font family to use
     * @param options - Optional style properties to apply
     * @returns A TextStyle object with the specified properties
     */
    abstract getFont(
        fontFamily: string,
        options?: {
            /** Base text style to merge with */
            textStyle?: TextStyle;
            /** Text color */
            color?: string;
            /** Background color */
            backgroundColor?: string;
            /** Font size in points */
            fontSize?: number;
            /** Font weight (e.g., 'normal', 'bold', '100'-'900') */
            fontWeight?: TextStyle['fontWeight'];
            /** Font style (e.g., 'normal', 'italic') */
            fontStyle?: TextStyle['fontStyle'];
            /** Line height multiplier */
            lineHeight?: number;
            /** Text decoration line (e.g., 'none', 'underline', 'line-through') */
            textDecorationLine?: TextStyle['textDecorationLine'];
            /** Text decoration color */
            textDecorationColor?: string;
            /** Text decoration style (e.g., 'solid', 'double', 'dotted', 'dashed') */
            textDecorationStyle?: TextStyle['textDecorationStyle'];
        }
    ): TextStyle;

    /**
     * Get the default font style for the application.
     * 
     * @returns The default TextStyle
     */
    abstract getDefaultFont(): TextStyle;
}
