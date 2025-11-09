import React, { useEffect, useRef } from 'react';
import { DigiaUI } from '../init/digia_ui';
import { DigiaUIManager } from '../init/digia_ui_manager';
import { DUIAppState } from '../config/app_state/global_state';
import { DUIFactory } from '../components/ui_factory';
import { DigiaUIScope } from '../framework/digia_ui_scope';
import { DUIAnalytics } from '../analytics/analytics';
import { MessageBus } from '../framework/message_bus';
import { ConfigProvider } from '../components/page/config_provider';
import { DUIFontFactory } from '../framework/font_factory';
import { IconData, ImageProvider } from '../components/ui_resources';

/**
 * Props for the DigiaUIApp component.
 */
export interface DigiaUIAppProps {
    /** The initialized DigiaUI instance containing configuration and resources */
    digiaUI: DigiaUI;

    /** Optional analytics handler for tracking user interactions and events */
    analytics?: DUIAnalytics;

    /** Optional message bus for inter-component communication */
    messageBus?: MessageBus;

    /** Custom page configuration provider, defaults to built-in provider if not specified */
    pageConfigProvider?: ConfigProvider;

    /** Custom icon mappings to override or extend default icons */
    icons?: Record<string, IconData>;

    /** Custom image provider mappings for app-specific images */
    images?: Record<string, ImageProvider>;

    /** Custom font factory for creating text styles with specific fonts */
    fontFactory?: DUIFontFactory;

    /** Environment variables to make available in expressions and configurations */
    environmentVariables?: Record<string, any>;

    /** Child components to render within the DigiaUI context */
    children: React.ReactNode;
}

/**
 * The main application wrapper for integrating Digia UI SDK into React Native applications.
 *
 * DigiaUIApp serves as the root component that manages the lifecycle of the Digia UI system
 * and provides a scope for analytics, messaging, and other core functionalities.
 *
 * This component handles:
 * - Initialization and disposal of the Digia UI system
 * - Global app state management
 * - UI factory setup with custom resources
 * - Analytics and message bus integration
 * - Environment variable configuration
 * - Providing Digia UI context to child components
 *
 * @example
 * ```typescript
 * import { DigiaUIApp } from '@digia/rn-sdk';
 *
 * const digiaUI = await DigiaUI.initialize(config);
 *
 * function App() {
 *   return (
 *     <DigiaUIApp
 *       digiaUI={digiaUI}
 *       analytics={myAnalyticsHandler}
 *       messageBus={myMessageBus}
 *       icons={customIcons}
 *       environmentVariables={{ authToken: '1234567890' }}
 *     >
 *       <NavigationContainer>
 *         {DUIFactory.getInstance().createInitialPage()}
 *       </NavigationContainer>
 *     </DigiaUIApp>
 *   );
 * }
 * ```
 */
export const DigiaUIApp: React.FC<DigiaUIAppProps> = ({
    digiaUI,
    analytics,
    messageBus,
    pageConfigProvider,
    icons,
    images,
    fontFactory,
    environmentVariables,
    children,
}) => {
    // Track initialization state to ensure cleanup only happens after initialization
    const initializedRef = useRef(false);

    useEffect(() => {
        // Initialize the Digia UI manager with the provided configuration
        DigiaUIManager.getInstance().initialize(digiaUI);

        // Initialize global app state with configuration from DSL
        DUIAppState.instance.init(digiaUI.dslConfig.appState ?? []);

        // Set up the UI factory with custom resources and providers
        DUIFactory.getInstance().initialize({
            pageConfigProvider,
            icons,
            images,
            fontFactory: fontFactory ?? null,
        });

        // Apply environment variables from DigiaUIApp if provided
        if (environmentVariables) {
            DUIFactory.getInstance().setEnvironmentVariables(environmentVariables);
        }

        // Mark as initialized
        initializedRef.current = true;

        // Cleanup function to run when component unmounts
        return () => {
            if (initializedRef.current) {
                // Clean up all Digia UI resources when the component is unmounted
                DigiaUIManager.getInstance().destroy();
                DUIAppState.instance.dispose();
                DUIFactory.getInstance().destroy();
            }
        };
    }, [digiaUI]); // Only re-run if digiaUI instance changes

    // Wrap the child component tree with DigiaUIScope to provide
    // analytics and message bus context to all descendant components
    return (
        <DigiaUIScope
            analyticsHandler={analytics}
            messageBus={messageBus}
        >
            {children}
        </DigiaUIScope>
    );
};

/**
 * Higher-order component (HOC) version of DigiaUIApp for class components.
 *
 * @example
 * ```typescript
 * const MyAppWithDigiaUI = withDigiaUI(MyApp, {
 *   digiaUI: await DigiaUI.initialize(config),
 *   analytics: myAnalyticsHandler,
 * });
 * ```
 */
export function withDigiaUI<P extends object>(
    Component: React.ComponentType<P>,
    digiaUIProps: Omit<DigiaUIAppProps, 'children'>
): React.FC<P> {
    return (props: P) => (
        <DigiaUIApp {...digiaUIProps}>
            <Component {...props} />
        </DigiaUIApp>
    );
}
