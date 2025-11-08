import React, { createContext, useContext, useMemo } from 'react';
import { TextStyle, useColorScheme } from 'react-native';
import { DUIFontFactory } from './font_factory';
import { ColorUtil } from './utils/color_util';

/**
 * Resources provided to the application.
 */
export interface ResourceProviderProps {
    /** Icon definitions by key */
    icons?: Record<string, any>;

    /** Image sources by key */
    images?: Record<string, any>;

    /** Text style definitions by token */
    textStyles?: Record<string, TextStyle | null>;

    /** Font factory for creating text styles */
    fontFactory?: DUIFontFactory | null;

    /** API model definitions by ID */
    apiModels?: Record<string, any>;

    /** Light mode color definitions */
    colors?: Record<string, string | null>;

    /** Dark mode color definitions */
    darkColors?: Record<string, string | null>;

    /** Navigator reference (for programmatic navigation) */
    navigatorKey?: any;
}

/**
 * Internal context value.
 */
interface ResourceContextValue extends ResourceProviderProps {
    /** Get color for current color scheme */
    getColor: (key: string) => string | null;

    /** Get font factory */
    getFontFactory: () => DUIFontFactory | null;

    /** Get text style from token */
    getFontFromToken: (token: string) => TextStyle | null;

    /** Get image provider */
    getImageProvider: (key: string) => any | null;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

/**
 * Provider component for application resources.
 * 
 * Provides access to:
 * - Icons and images
 * - Text styles and fonts
 * - Color palettes (light and dark)
 * - API models
 * - Navigation reference
 * 
 * @example
 * ```tsx
 * <ResourceProvider
 *   colors={{ primary: '#007AFF', secondary: '#5AC8FA' }}
 *   darkColors={{ primary: '#0A84FF', secondary: '#64D2FF' }}
 *   fontFactory={myFontFactory}
 *   apiModels={apiModels}
 * >
 *   <App />
 * </ResourceProvider>
 * ```
 */
export const ResourceProvider: React.FC<
    ResourceProviderProps & { children: React.ReactNode }
> = ({
    children,
    icons = {},
    images = {},
    textStyles = {},
    fontFactory = null,
    apiModels = {},
    colors = {},
    darkColors = {},
    navigatorKey,
}) => {
    const colorScheme = useColorScheme();

    const contextValue = useMemo<ResourceContextValue>(
        () => ({
            icons,
            images,
            textStyles,
            fontFactory,
            apiModels,
            colors,
            darkColors,
            navigatorKey,

            getColor: (key: string): string | null => {
                const colorMap = colorScheme === 'dark' ? darkColors : colors;
                return colorMap[key] ?? ColorUtil.fromString(key);
            },

            getFontFactory: (): DUIFontFactory | null => {
                return fontFactory;
            },

            getFontFromToken: (token: string): TextStyle | null => {
                return textStyles[token] ?? null;
            },

            getImageProvider: (key: string): any | null => {
                return images[key] ?? null;
            },
        }),
        [
            icons,
            images,
            textStyles,
            fontFactory,
            apiModels,
            colors,
            darkColors,
            navigatorKey,
            colorScheme,
        ]
    );

    return (
        <ResourceContext.Provider value={contextValue}>
            {children}
        </ResourceContext.Provider>
    );
};

/**
 * Hook to access resource provider.
 * 
 * @returns ResourceContext value or null if not within provider
 * 
 * @example
 * ```tsx
 * const resources = useResourceProvider();
 * const primaryColor = resources?.getColor('primary');
 * const fontFactory = resources?.getFontFactory();
 * ```
 */
export function useResourceProvider(): ResourceContextValue | null {
    return useContext(ResourceContext);
}

/**
 * Hook to access resource provider (throws if not within provider).
 * 
 * @returns ResourceContext value
 * @throws Error if not within ResourceProvider
 * 
 * @example
 * ```tsx
 * const resources = useRequiredResourceProvider();
 * const primaryColor = resources.getColor('primary');
 * ```
 */
export function useRequiredResourceProvider(): ResourceContextValue {
    const context = useContext(ResourceContext);
    if (!context) {
        throw new Error(
            'useRequiredResourceProvider must be used within a ResourceProvider'
        );
    }
    return context;
}
