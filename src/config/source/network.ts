import type { DUIConfig } from '../model';
import type { ConfigProvider } from '../provider';
import { ConfigSource } from './base';
import { ConfigException, ConfigErrorType } from '../exception';

/**
 * Options for creating a NetworkConfigSource.
 */
export interface NetworkConfigSourceOptions {
    /** The configuration provider */
    provider: ConfigProvider;

    /** Network path/URL to fetch config from */
    networkPath: string;

    /** Timeout for network operations in milliseconds */
    timeout?: number;
}

/**
 * Configuration source that loads config directly from network.
 * 
 * This source fetches the complete configuration JSON from a network
 * endpoint. Unlike NetworkFileConfigSource, it doesn't use a separate
 * metadata endpoint or caching - it loads the config directly in one request.
 * 
 * @example
 * ```typescript
 * const source = new NetworkConfigSource({
 *   provider: myProvider,
 *   networkPath: 'https://api.example.com/config',
 *   timeout: 10000 // 10 seconds
 * });
 * 
 * try {
 *   const config = await source.getConfig();
 * } catch (error) {
 *   if (error instanceof ConfigException && error.type === ConfigErrorType.Network) {
 *     console.error('Network error loading config');
 *   }
 * }
 * ```
 */
export class NetworkConfigSource implements ConfigSource {
    private readonly provider: ConfigProvider;
    private readonly networkPath: string;
    private readonly timeout?: number;

    /**
     * Creates a new NetworkConfigSource.
     * 
     * @param options - Configuration options
     * @param options.provider - The configuration provider
     * @param options.networkPath - Network path to fetch config from
     * @param options.timeout - Network timeout in milliseconds
     */
    constructor(options: NetworkConfigSourceOptions) {
        this.provider = options.provider;
        this.networkPath = options.networkPath;
        this.timeout = options.timeout;
    }

    /**
     * Load configuration from network.
     * 
     * Fetches the complete configuration JSON from the network endpoint,
     * parses it into a DUIConfig object, and initializes functions.
     * 
     * @returns A promise that resolves to the DUIConfig
     * @throws ConfigException with type NETWORK if the network request fails
     */
    async getConfig(): Promise<DUIConfig> {
        try {
            const networkData = await this.provider.getAppConfigFromNetwork(
                this.networkPath
            );

            if (!networkData) {
                throw new ConfigException(
                    'Network response is null',
                    { type: ConfigErrorType.Network }
                );
            } const appConfig = networkData as DUIConfig;

            await this.provider.initFunctions({
                remotePath: appConfig.functionsFilePath,
            });

            return appConfig;
        } catch (error) {
            // If it's already a ConfigException, re-throw it
            if (error instanceof ConfigException) {
                throw error;
            }

            // Otherwise, wrap it in a ConfigException
            throw new ConfigException(
                'Failed to load config from network',
                {
                    type: ConfigErrorType.Network,
                    originalError: error,
                }
            );
        }
    }
}