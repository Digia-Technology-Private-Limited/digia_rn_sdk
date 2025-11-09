/// Container class for all UI resources used by the Digia UI system.
///
/// UIResources holds mappings for icons, images, text styles, colors,
/// and font factories that can be used throughout the application.

import { TextStyle, ImageSourcePropType } from "react-native";
import { DUIFontFactory } from "../framework/font_factory";

/// This allows for centralized resource management and easy customization.

/**
 * Represents icon data for UI components.
 * In React Native, icons are typically represented as components or image sources.
 */
export type IconData = {
    /** The icon component or image source */
    source: ImageSourcePropType | React.ComponentType<any>;
    /** Optional icon size */
    size?: number;
    /** Optional icon color */
    color?: string;
};

/**
 * Represents an image provider for UI components.
 * In React Native, this is typically an ImageSourcePropType.
 */
export type ImageProvider = ImageSourcePropType;

/**
 * Represents a color value.
 * In React Native, colors are represented as strings.
 */
export type Color = string;
export class UIResources {
    /// Mapping of icon names to IconData objects for use in UI components
    readonly icons?: Map<string, IconData>;

    /// Mapping of image names to ImageProvider objects for use in UI components
    readonly images?: Map<string, ImageProvider>;

    /// Mapping of text style names to TextStyle objects for consistent typography
    readonly textStyles?: Map<string, TextStyle>;

    /// Mapping of color token names to Color objects for light theme
    readonly colors?: Map<string, Color>;

    /// Mapping of color token names to Color objects for dark theme
    readonly darkColors?: Map<string, Color>;

    /// Factory for creating custom fonts and text styles
    readonly fontFactory?: DUIFontFactory;

    /// Creates a new UIResources instance with the provided resource mappings.
    constructor({
        icons,
        images,
        textStyles,
        colors,
        darkColors,
        fontFactory,
    }: {
        icons?: Map<string, IconData>;
        images?: Map<string, ImageProvider>;
        textStyles?: Map<string, TextStyle>;
        colors?: Map<string, Color>;
        darkColors?: Map<string, Color>;
        fontFactory?: DUIFontFactory;
    }) {
        this.icons = icons;
        this.images = images;
        this.textStyles = textStyles;
        this.colors = colors;
        this.darkColors = darkColors;
        this.fontFactory = fontFactory;
    }
}