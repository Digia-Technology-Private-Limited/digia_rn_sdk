import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { MessageBus } from './message_bus';
import { DUIAnalytics } from '../analytics/analytics';


/**
 * Context value provided by DigiaUIScope.
 */
export interface DigiaUIScopeValue {
    /**
     * The message bus instance for inter-component communication.
     */
    messageBus: MessageBus;

    /**
     * Optional analytics handler for tracking events.
     */
    analyticsHandler?: DUIAnalytics;
}

/**
 * React Context for Digia UI SDK resources.
 * 
 * This context provides access to the MessageBus and analytics handler
 * throughout the component tree.
 */
const DigiaUIScopeContext = createContext<DigiaUIScopeValue | null>(null);

/**
 * Props for the DigiaUIScope provider component.
 */
export interface DigiaUIScopeProps {
    /**
     * The message bus instance used for communication within the SDK.
     * If not provided, a new MessageBus instance will be created.
     */
    messageBus?: MessageBus;

    /**
     * Optional analytics handler for tracking events.
     */
    analyticsHandler?: DUIAnalytics;

    /**
     * Child components that will have access to the SDK features.
     */
    children: ReactNode;
}

/**
 * Provides access to Digia UI SDK resources through the React component tree.
 * 
 * This component must be placed above any components that need access to the SDK features.
 * It manages a MessageBus instance that enables communication between different parts
 * of the application.
 * 
 * @example
 * ```typescript
 * import { DigiaUIScope } from '@digia/rn-sdk';
 * 
 * function App() {
 *   return (
 *     <DigiaUIScope>
 *       <NavigationContainer>
 *         <YourApp />
 *       </NavigationContainer>
 *     </DigiaUIScope>
 *   );
 * }
 * 
 * // Access in child components
 * function MyComponent() {
 *   const { messageBus, analyticsHandler } = useDigiaUIScope();
 *   
 *   useEffect(() => {
 *     // Listen to messages
 *     const unsubscribe = messageBus.subscribe('eventName', (data) => {
 *       console.log('Received:', data);
 *     });
 *     
 *     return unsubscribe;
 *   }, [messageBus]);
 *   
 *   return <View>...</View>;
 * }
 * ```
 */
export const DigiaUIScope: React.FC<DigiaUIScopeProps> = ({
    messageBus: providedMessageBus,
    analyticsHandler,
    children,
}) => {
    // Create a stable MessageBus instance if not provided
    const messageBus = useMemo(
        () => providedMessageBus ?? new MessageBus(),
        [providedMessageBus]
    );

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<DigiaUIScopeValue>(
        () => ({
            messageBus,
            analyticsHandler,
        }),
        [messageBus, analyticsHandler]
    );

    return (
        <DigiaUIScopeContext.Provider value={value}>
            {children}
        </DigiaUIScopeContext.Provider>
    );
};

/**
 * Hook to access the DigiaUIScope context.
 * 
 * This hook provides access to SDK features from descendant components.
 * Will throw an error if no DigiaUIScope is found in the component tree.
 * 
 * @returns The DigiaUIScope context value
 * @throws Error if used outside of DigiaUIScope provider
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { messageBus, analyticsHandler } = useDigiaUIScope();
 *   
 *   // Use messageBus
 *   messageBus.publish('myEvent', { data: 'value' });
 *   
 *   // Track analytics
 *   analyticsHandler?.trackEvent('button_click', { buttonId: 'submit' });
 *   
 *   return <View>...</View>;
 * }
 * ```
 */
export function useDigiaUIScope(): DigiaUIScopeValue {
    const context = useContext(DigiaUIScopeContext);

    if (context === null) {
        throw new Error(
            'useDigiaUIScope must be used within a DigiaUIScope provider. ' +
            'Wrap your app with <DigiaUIScope> to access SDK features.'
        );
    }

    return context;
}

/**
 * Hook to access the MessageBus directly.
 * 
 * Convenience hook that returns just the MessageBus instance.
 * 
 * @returns The MessageBus instance
 * @throws Error if used outside of DigiaUIScope provider
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const messageBus = useMessageBus();
 *   
 *   messageBus.publish('myEvent', { data: 'value' });
 *   
 *   return <View>...</View>;
 * }
 * ```
 */
export function useMessageBus(): MessageBus {
    return useDigiaUIScope().messageBus;
}

/**
 * Hook to access the analytics handler directly.
 * 
 * Convenience hook that returns just the analytics handler.
 * 
 * @returns The analytics handler if configured, undefined otherwise
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const analytics = useAnalytics();
 *   
 *   const handleClick = () => {
 *     analytics?.trackEvent('button_click', { buttonId: 'submit' });
 *   };
 *   
 *   return <Button onPress={handleClick}>Submit</Button>;
 * }
 * ```
 */
export function useAnalytics(): DUIAnalytics | undefined {
    return useDigiaUIScope().analyticsHandler;
}
