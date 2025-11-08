/**
 * Configuration class for network communication settings.
 * 
 * This class defines network-related settings such as default headers,
 * timeout values, and other HTTP client configuration options used
 * throughout the SDK.
 */
export class NetworkConfiguration {
    /** Default headers to include with all network requests. */
    readonly defaultHeaders: Record<string, any>;

    /** Request timeout in milliseconds. */
    readonly timeoutInMs: number;

    /**
     * Creates a network configuration with the specified settings.
     * 
     * @param defaultHeaders - Default headers to include with all network requests
     * @param timeoutInMs - Request timeout in milliseconds
     */
    constructor(defaultHeaders: Record<string, any>, timeoutInMs: number) {
        this.defaultHeaders = defaultHeaders;
        this.timeoutInMs = timeoutInMs;
    }

    /**
     * Creates a network configuration with default values.
     * 
     * @param options - Configuration options
     * @param options.defaultHeaders - Default headers to include with all network requests. Will be empty if not provided.
     * @param options.timeoutInMs - Request timeout in milliseconds. Will be 30 seconds (30000ms) if not provided.
     * @returns A new NetworkConfiguration instance with default values
     */
    static withDefaults(options?: {
        defaultHeaders?: Record<string, any>;
        timeoutInMs?: number;
    }): NetworkConfiguration {
        return new NetworkConfiguration(
            options?.defaultHeaders ?? {},
            options?.timeoutInMs ?? 30000
        );
    }
}