/**
 * Sealed class representing different hosting environments for Digia UI.
 *
 * DigiaUIHost defines the hosting configuration for the Digia UI system,
 * allowing different deployment scenarios and resource proxy configurations.
 * This abstraction enables support for various hosting environments while
 * maintaining consistent API access patterns.
 *
 * The class supports resource proxy URLs for scenarios where assets need
 * to be served through a different endpoint than the main API.
 */
export abstract class DigiaUIHost {
    /** Optional URL for proxying resource requests (images, fonts, etc.) */
    readonly resourceProxyUrl?: string;

    /**
     * Creates a new DigiaUIHost with optional resource proxy configuration.
     *
     * @param resourceProxyUrl - URL to proxy resource requests through
     */
    constructor(resourceProxyUrl?: string) {
        this.resourceProxyUrl = resourceProxyUrl;
    }
}

/**
 * Host configuration for Digia Dashboard deployment.
 *
 * DashboardHost represents the standard Digia Studio dashboard hosting
 * environment. This is the most common deployment scenario where the
 * application connects to the official Digia Studio backend services.
 *
 * @example
 * ```typescript
 * const host = new DashboardHost(
 *   'https://cdn.example.com' // Optional resource proxy URL
 * );
 * ```
 */
export class DashboardHost extends DigiaUIHost {
    /**
     * Creates a new DashboardHost configuration.
     *
     * This represents the standard Digia Studio dashboard hosting environment.
     * Resource proxy URL can be provided to serve static assets through
     * a different CDN or proxy service.
     *
     * @param resourceProxyUrl - Optional URL to proxy resource requests
     */
    constructor(resourceProxyUrl?: string) {
        super(resourceProxyUrl);
    }
}

/**
 * State types for debugging and inspection.
 */
export enum StateType {
    App = 'app',
    Page = 'page',
    Component = 'component',
}

/**
 * State observer interface for capturing state changes during debugging.
 */
export interface StateObserver {
    /**
     * Called when a new state is created.
     */
    onCreate(options: {
        id: string;
        stateType: StateType;
        namespace: string;
        stateData: Record<string, any>;
    }): void;

    /**
     * Called when a state value changes.
     */
    onChange(options: {
        id: string;
        stateType: StateType;
        namespace: string;
        stateData: Record<string, any>;
    }): void;

    /**
     * Called when a state is disposed.
     */
    onDispose(options: {
        id: string;
        stateType: StateType;
        namespace: string;
        stateData: Record<string, any>;
    }): void;
}

/**
 * Inspector interface for capturing debug information and events.
 *
 * Custom inspectors can be provided to integrate with existing logging
 * infrastructure or to capture specific types of debug information.
 * The inspector receives events from throughout the Digia UI system.
 */
export interface DigiaInspector {
    /**
     * Log a debug message
     */
    log(message: string, data?: any): void;

    /**
     * Log an error
     */
    error(message: string, error?: Error): void;

    /**
     * Log a network request
     */
    logRequest?(url: string, method: string, data?: any): void;

    /**
     * Log a network response
     */
    logResponse?(url: string, status: number, data?: any): void;

    /**
     * State observer for tracking state lifecycle events
     */
    stateObserver?: StateObserver;
}

/**
 * Developer configuration for debugging and development features.
 *
 * DeveloperConfig provides configuration options specifically designed
 * for development and debugging scenarios. This includes proxy settings,
 * logging configuration, inspection tools, and custom backend URLs.
 *
 * Key features:
 * - **Proxy Support**: Route traffic through debugging proxies
 * - **Inspection Tools**: Network request monitoring and debugging
 * - **Custom Logging**: Configurable logging for development insights
 * - **Backend Override**: Use custom backend URLs for testing
 * - **Host Configuration**: Custom hosting environment settings
 *
 * The configuration is typically only used in debug builds and should
 * not be included in production releases for security and performance reasons.
 *
 * @example
 * ```typescript
 * const developerConfig = new DeveloperConfig({
 *   proxyUrl: '192.168.1.100:8888', // Charles Proxy
 *   inspector: new MyCustomInspector(),
 *   baseUrl: 'https://dev-api.digia.tech/api/v1',
 *   host: new DashboardHost(),
 * });
 * ```
 */
export class DeveloperConfig {
    /**
     * Proxy URL for routing HTTP traffic through debugging tools.
     *
     * This is typically used with tools like Charles Proxy, Fiddler, or
     * other network debugging proxies. The URL should include the port
     * number (e.g., '192.168.1.100:8888').
     *
     * Only applies to Android/iOS platforms in debug mode.
     */
    readonly proxyUrl?: string;

    /**
     * Inspector instance for capturing debug information and events.
     *
     * Custom inspectors can be provided to integrate with existing logging
     * infrastructure or to capture specific types of debug information.
     * The inspector receives events from throughout the Digia UI system.
     */
    readonly inspector?: DigiaInspector;

    /**
     * Host configuration for custom deployment environments.
     *
     * Allows overriding the default hosting configuration to connect to
     * custom backend deployments or use different resource serving strategies.
     */
    readonly host?: DigiaUIHost;

    /**
     * Base URL for Digia Studio backend API requests.
     *
     * This allows connecting to custom backend deployments such as:
     * - Development/staging environments
     * - Self-hosted Digia Studio instances
     * - Local development servers
     *
     * Defaults to the production Digia Studio API URL.
     */
    readonly baseUrl: string;

    /**
     * Creates a new DeveloperConfig with optional debugging and development features.
     *
     * All parameters are optional, allowing selective enablement of development
     * features based on specific debugging needs.
     *
     * @param options - Configuration options
     * @param options.proxyUrl - HTTP proxy URL for network debugging
     * @param options.inspector - Custom inspector for debug information
     * @param options.host - Custom host configuration
     * @param options.baseUrl - Custom backend API URL (defaults to production)
     */
    constructor(options?: {
        proxyUrl?: string;
        inspector?: DigiaInspector;
        host?: DigiaUIHost;
        baseUrl?: string;
    }) {
        this.proxyUrl = options?.proxyUrl;
        this.inspector = options?.inspector;
        this.host = options?.host;
        this.baseUrl = options?.baseUrl ?? 'https://app.digia.tech/api/v1';
    }
}
