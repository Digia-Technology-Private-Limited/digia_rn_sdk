import { DUIConfig } from '../model';
import type { ConfigProvider } from '../provider';
import { ConfigSource } from './base';
import { ConfigException } from '../exception';
import { JsonLike } from '../../framework/utils';

/**
 * Options for creating a NetworkFileConfigSource.
 */
export interface NetworkFileConfigSourceOptions {
    /** The configuration provider */
    provider: ConfigProvider;

    /** Network path/URL to fetch config metadata */
    networkPath: string;

    /** Local file path for caching the config (default: 'appConfig.json') */
    cacheFilePath?: string;

    /** Timeout for download operations in milliseconds */
    timeout?: number;
}

/**
 * Configuration source that downloads config from network and caches it.
 * 
 * This source fetches configuration metadata from a network endpoint,
 * checks if a new version is available, downloads the config file if needed,
 * and caches it locally for offline access. Supports version checking to
 * avoid unnecessary downloads.
 * 
 * @example
 * ```typescript
 * const source = new NetworkFileConfigSource({
 *   provider: myProvider,
 *   networkPath: 'https://api.example.com/config/metadata',
 *   cacheFilePath: 'appConfig.json',
 *   timeout: 30000 // 30 seconds
 * });
 * 
 * const config = await source.getConfig();
 * ```
 */
export class NetworkFileConfigSource implements ConfigSource {
    private readonly provider: ConfigProvider;
    private readonly networkPath: string;
    private readonly cacheFilePath: string;
    private readonly timeout?: number;

    /**
     * Creates a new NetworkFileConfigSource.
     * 
     * @param options - Configuration options
     * @param options.provider - The configuration provider
     * @param options.networkPath - Network path to fetch config metadata
     * @param options.cacheFilePath - Local cache file path (default: 'appConfig.json')
     * @param options.timeout - Download timeout in milliseconds
     */
    constructor(options: NetworkFileConfigSourceOptions) {
        this.provider = options.provider;
        this.networkPath = options.networkPath;
        this.cacheFilePath = options.cacheFilePath ?? 'appConfig.json';
        this.timeout = options.timeout;
    }

    /**
     * Load configuration from network or cache.
     * 
     * 1. Fetches config metadata from network
     * 2. Checks if new version should be downloaded
     * 3. If not, loads from cache
     * 4. If yes, downloads new config and caches it
     * 5. Initializes functions from the config
     * 
     * @returns A promise that resolves to the DUIConfig
     * @throws ConfigException if metadata fetch fails, download fails, or cache is unavailable
     */
    async getConfig(): Promise<DUIConfig> {
        // 1. Get file metadata from network
        const metadata = await this.getConfigMetadata();

        if (!this.shouldDownloadNewConfig(metadata)) {
            return await this.loadCachedConfig();
        }

        // 2. Download and cache the file
        const fileUrl = this.getFileUrl(metadata);
        const config = await this.downloadAndCacheConfig(fileUrl);
        console.log('Downloaded new config from network:', config);
        // 3. Initialize functions
        await this.provider.initFunctions({
            remotePath: config.functionsFilePath,
            version: config.version,
        });

        return config;
    }

    /**
     * Extract the config file URL from metadata.
     * 
     * @param metadata - The config metadata object
     * @returns The config file URL
     * @throws ConfigException if URL is not found in metadata
     */
    private getFileUrl(metadata: Record<string, any>): string {
        const fileUrl = metadata.appConfigFileUrl as string | undefined;
        if (!fileUrl) {
            throw new ConfigException('Config File URL not found');
        }
        return fileUrl;
    }

    /**
     * Fetch config metadata from network.
     * 
     * @returns The config metadata as a JSON object
     * @throws ConfigException if fetch fails or returns empty data
     */
    private async getConfigMetadata(): Promise<JsonLike> {
        const data = await this.provider.getAppConfigFromNetwork(this.networkPath);

        if (!data || Object.keys(data).length === 0) {
            throw new ConfigException('Failed to fetch config metadata');
        }

        return data;
    }

    /**
     * Check if a new config version should be downloaded.
     * 
     * @param metadata - The config metadata object
     * @returns True if new config should be downloaded, false to use cache
     */
    private shouldDownloadNewConfig(metadata: Record<string, any>): boolean {
        return metadata.versionUpdated !== false;
    }

    /**
     * Load configuration from local cache.
     * 
     * @returns The cached DUIConfig
     * @throws ConfigException if no cached config is found
     */
    private async loadCachedConfig(): Promise<DUIConfig> {
        const cachedJson = await this.provider.fileOps.readString(
            this.cacheFilePath
        );

        if (cachedJson === null || cachedJson === undefined) {
            throw new ConfigException('No cached config found');
        }

        return new DUIConfig(JSON.parse(cachedJson));
    }

    /**
     * Download config file from network and cache it locally.
     * 
     * @param fileUrl - The URL to download the config from
     * @returns The downloaded and parsed DUIConfig
     * @throws ConfigException if download fails or times out
     */
    private async downloadAndCacheConfig(fileUrl: string): Promise<DUIConfig> {
        // Download file with optional timeout
        const downloadPromise = this.provider.downloadOps.downloadFile(
            fileUrl,
            this.cacheFilePath
        );

        let file;
        if (this.timeout !== undefined) {
            // Race between download and timeout
            const timeoutPromise = new Promise<null>((resolve) =>
                setTimeout(() => resolve(null), this.timeout)
            );
            file = await Promise.race([downloadPromise, timeoutPromise]);
        } else {
            file = await downloadPromise;
        }

        if (!file || !file.data) {
            throw new ConfigException('Failed to download config file');
        }

        // Convert Uint8Array to string
        const fileString = new TextDecoder('utf-8').decode(file.data);

        // Parse and return config
        return new DUIConfig(JSON.parse(fileString));
    }
}
