import React, { useState, useEffect } from 'react';
import { DigiaUI } from '../init/digia_ui';
import { DigiaUIOptions } from '../init/options';
import { DigiaUIApp } from './DigiaUIApp';
import { DUIAnalytics } from '../analytics/analytics';
import { MessageBus } from '../framework/message_bus';
import { ConfigProvider } from '../components/page/config_provider';
import { DUIFontFactory } from '../framework/font_factory';
import { IconData, ImageProvider } from '../components/ui_resources';

/**
 * Enumeration representing the different states of Digia UI initialization.
 */
export enum DigiaUIState {
    /** Initialization is in progress */
    Loading = 'loading',

    /** Initialization completed successfully and system is ready to use */
    Ready = 'ready',

    /** Initialization failed with an error */
    Error = 'error',
}

/**
 * Represents the current status of Digia UI initialization process.
 *
 * This class encapsulates the current state along with relevant data
 * such as the initialized DigiaUI instance (when ready) or error
 * information (when failed).
 */
export class DigiaUIStatus {
    /** The current state of initialization */
    readonly state: DigiaUIState;

    /** The initialized DigiaUI instance (only available when state is ready) */
    readonly digiaUI?: DigiaUI;

    /** Error that occurred during initialization (only available when state is error) */
    readonly error?: Error;

    /** Stack trace associated with the error (only available when state is error) */
    readonly stackTrace?: string;

    /** Private constructor for creating status instances */
    private constructor(options: {
        state: DigiaUIState;
        digiaUI?: DigiaUI;
        error?: Error;
        stackTrace?: string;
    }) {
        this.state = options.state;
        this.digiaUI = options.digiaUI;
        this.error = options.error;
        this.stackTrace = options.stackTrace;
    }

    /** Creates a loading status indicating initialization is in progress */
    static loading(): DigiaUIStatus {
        return new DigiaUIStatus({ state: DigiaUIState.Loading });
    }

    /** Creates a ready status with the initialized DigiaUI instance */
    static ready(digiaUI: DigiaUI): DigiaUIStatus {
        return new DigiaUIStatus({ state: DigiaUIState.Ready, digiaUI });
    }

    /** Creates an error status with error details and optional stack trace */
    static error(error: Error, stackTrace?: string): DigiaUIStatus {
        return new DigiaUIStatus({ state: DigiaUIState.Error, error, stackTrace });
    }

    /** Returns true if initialization is currently in progress */
    get isLoading(): boolean {
        return this.state === DigiaUIState.Loading;
    }

    /** Returns true if initialization completed successfully */
    get isReady(): boolean {
        return this.state === DigiaUIState.Ready;
    }

    /** Returns true if initialization failed with an error */
    get hasError(): boolean {
        return this.state === DigiaUIState.Error;
    }
}

/**
 * Props for the DigiaUIAppBuilder component.
 */
export interface DigiaUIAppBuilderProps {
    /** Configuration options for initializing the Digia UI system */
    options: DigiaUIOptions;

    /**
     * Builder function that receives the current initialization status
     * and should return appropriate components for each state
     */
    children: (status: DigiaUIStatus) => React.ReactNode;

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
}

/**
 * A component that handles the asynchronous initialization of the Digia UI system.
 *
 * DigiaUIAppBuilder provides a builder pattern that allows you to handle different
 * states during the initialization process (loading, ready, error). This is the
 * recommended way to initialize Digia UI as it properly manages the async initialization
 * flow and provides appropriate feedback to users.
 *
 * The component will:
 * - Show loading state while initializing
 * - Transition to ready state with DigiaUIApp when initialization succeeds
 * - Show error state if initialization fails
 *
 * @example
 * ```typescript
 * import { DigiaUIAppBuilder, DigiaUIStatus } from '@digia/rn-sdk';
 *
 * function App() {
 *   return (
 *     <DigiaUIAppBuilder
 *       options={{
 *         accessKey: 'YOUR_ACCESS_KEY',
 *         flavor: Flavor.production(),
 *       }}
 *     >
 *       {(status: DigiaUIStatus) => {
 *         if (status.isLoading) {
 *           return <LoadingScreen />;
 *         }
 *         if (status.hasError) {
 *           return <ErrorScreen error={status.error} />;
 *         }
 *         return (
 *           <NavigationContainer>
 *             {DUIFactory.getInstance().createInitialPage()}
 *           </NavigationContainer>
 *         );
 *       }}
 *     </DigiaUIAppBuilder>
 *   );
 * }
 * ```
 */
export const DigiaUIAppBuilder: React.FC<DigiaUIAppBuilderProps> = ({
    options,
    children,
    analytics,
    messageBus,
    pageConfigProvider,
    icons,
    images,
    fontFactory,
    environmentVariables,
}) => {
    // Current initialization status, starts with loading state
    const [status, setStatus] = useState<DigiaUIStatus>(DigiaUIStatus.loading());

    useEffect(() => {
        let isMounted = true;

        // Asynchronously initializes the Digia UI system and updates the status
        const initialize = async () => {
            try {
                // Attempt to create and initialize DigiaUI with provided options
                console.log('Initializing DigiaUI with options:', options);
                const digiaUI = await DigiaUI.initialize(options);
                console.log('DigiaUI initialized successfully:', digiaUI);
                // Only update state if the component is still mounted to avoid memory leaks
                if (isMounted) {
                    setStatus(DigiaUIStatus.ready(digiaUI));
                }
            } catch (error) {
                // Handle initialization errors and update status accordingly
                if (isMounted) {
                    const errorObj = error instanceof Error ? error : new Error(String(error));
                    const stackTrace = errorObj.stack;
                    setStatus(DigiaUIStatus.error(errorObj, stackTrace));
                }
            }
        };

        initialize();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [options]); // Re-initialize if options change

    // If not ready, let the builder handle loading/error states
    if (!status.isReady) {
        return <>{children(status)}</>;
    }

    // When ready, wrap with DigiaUIApp and pass through all configuration
    return (
        <DigiaUIApp
            digiaUI={status.digiaUI!}
            messageBus={messageBus}
            analytics={analytics}
            pageConfigProvider={pageConfigProvider}
            icons={icons}
            images={images}
            fontFactory={fontFactory}
            environmentVariables={environmentVariables}
        >
            {children(status)}
        </DigiaUIApp>
    );
};

/**
 * Higher-order component (HOC) version of DigiaUIAppBuilder.
 *
 * @example
 * ```typescript
 * const MyAppWithDigiaUI = withDigiaUIBuilder(MyApp, {
 *   options: {
 *     accessKey: 'YOUR_ACCESS_KEY',
 *     flavor: Flavor.production(),
 *   },
 *   analytics: myAnalyticsHandler,
 * });
 * ```
 */
export function withDigiaUIBuilder<P extends object>(
    Component: React.ComponentType<P & { status: DigiaUIStatus }>,
    builderProps: Omit<DigiaUIAppBuilderProps, 'children'>
): React.FC<P> {
    return (props: P) => (
        <DigiaUIAppBuilder {...builderProps}>
            {(status) => <Component {...props} status={status} />}
        </DigiaUIAppBuilder>
    );
}
