import { useContext, createContext } from 'react';

/**
 * Analytics handler interface for tracking events and user interactions.
 */
export interface DUIAnalytics {
    /**
     * Track a screen view event
     */
    trackScreenView?(screenName: string, params?: Record<string, any>): void;

    /**
     * Track a custom event
     */
    trackEvent?(eventName: string, params?: Record<string, any>): void;

    /**
     * Track a user action
     */
    trackAction?(actionName: string, params?: Record<string, any>): void;

    /**
     * Set user properties
     */
    setUserProperties?(properties: Record<string, any>): void;
}

/**
 * Digia UI instance interface
 */
export interface DigiaUI {
    /**
     * Get the current configuration
     */
    getConfig(): any;

    /**
     * Refresh the configuration
     */
    refreshConfig(): Promise<void>;

    /**
     * Navigate to a page
     */
    navigateToPage?(pageId: string, params?: Record<string, any>): void;

    /**
     * Go back
     */
    navigateBack?(): void;
}

/**
 * Digia UI Context value
 */
export interface DigiaUIContextValue {
    digiaUi?: DigiaUI;
    analyticsHandler?: DUIAnalytics;
}

/**
 * React Context for Digia UI
 * Provides access to the Digia UI instance and analytics handler throughout the component tree.
 */
export const DigiaUIContext = createContext<DigiaUIContextValue>({
    digiaUi: undefined,
    analyticsHandler: undefined,
});

/**
 * Hook to access the Digia UI instance from any component.
 * 
 * @returns The Digia UI instance or undefined if not available
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const digiaUi = useDigiaUI();
 *   
 *   const handleRefresh = async () => {
 *     await digiaUi?.refreshConfig();
 *   };
 *   
 *   return <Button onPress={handleRefresh} title="Refresh" />;
 * }
 * ```
 */
export function useDigiaUI(): DigiaUI | undefined {
    const context = useContext(DigiaUIContext);
    return context.digiaUi;
}

/**
 * Hook to access the analytics handler from any component.
 * 
 * @returns The analytics handler or undefined if not available
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const analytics = useAnalytics();
 *   
 *   const handleButtonPress = () => {
 *     analytics?.trackEvent('button_pressed', {
 *       button_name: 'submit',
 *       screen: 'home'
 *     });
 *   };
 *   
 *   return <Button onPress={handleButtonPress} title="Submit" />;
 * }
 * ```
 */
export function useAnalytics(): DUIAnalytics | undefined {
    const context = useContext(DigiaUIContext);
    return context.analyticsHandler;
}

/**
 * Hook to access the full Digia UI context.
 * 
 * @returns The complete Digia UI context value
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { digiaUi, analyticsHandler } = useDigiaUIContext();
 *   
 *   return (
 *     <View>
 *       <Text>UI Available: {digiaUi ? 'Yes' : 'No'}</Text>
 *       <Text>Analytics Available: {analyticsHandler ? 'Yes' : 'No'}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useDigiaUIContext(): DigiaUIContextValue {
    return useContext(DigiaUIContext);
}

/**
 * Provider component for Digia UI context.
 * Wrap your app with this to provide Digia UI and analytics access to all child components.
 * 
 * @example
 * ```typescript
 * import { DigiaUIProvider } from '@digia/rn-sdk';
 * 
 * function App() {
 *   const digiaUi = DigiaSDK.getInstance();
 *   const analytics = new MyAnalyticsHandler();
 *   
 *   return (
 *     <DigiaUIProvider digiaUi={digiaUi} analyticsHandler={analytics}>
 *       <MyApp />
 *     </DigiaUIProvider>
 *   );
 * }
 * ```
 */
export const DigiaUIProvider = DigiaUIContext.Provider;
