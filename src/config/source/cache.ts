import { DUIConfig } from '../model';
import type { ConfigProvider } from '../provider';
import { ConfigSource } from './base';
import { ConfigException } from '../exception';

/**
 * Configuration source that loads config from local cache.
 * 
 * This source reads previously cached configuration from the local
 * file system. It's typically used as a fallback when network is
 * unavailable or for faster initial app loads.
 * 
 * @example
 * ```typescript
 * const provider = new MyConfigProvider();
 * const source = new CachedConfigSource(
 *   provider,
 *   '/path/to/cached-config.json'
 * );
 * 
 * try {
 *   const config = await source.getConfig();
 * } catch (error) {
 *   if (error instanceof ConfigException) {
 *     console.log('No cached config available');
 *   }
 * }
 * ```
 */
export class CachedConfigSource implements ConfigSource {
    private readonly provider: ConfigProvider;
    private readonly cachedFilePath: string;

    /**
     * Creates a new CachedConfigSource.
     * 
     * @param provider - The configuration provider with fileOps support
     * @param cachedFilePath - Path to the cached configuration file
     */
    constructor(provider: ConfigProvider, cachedFilePath: string) {
        this.provider = provider;
        this.cachedFilePath = cachedFilePath;
    }

    /**
     * Load configuration from local cache.
     * 
     * Reads the cached configuration JSON from the file system and parses it
     * into a DUIConfig object. Also initializes functions from the remote path
     * specified in the cached config.
     * 
     * @returns A promise that resolves to the parsed DUIConfig
     * @throws ConfigException if no cached config is found
     * @throws Error if the cached file cannot be read or parsed
     */
    async getConfig(): Promise<DUIConfig> {
        // Read the cached configuration file as a string
        const cachedJson = await this.provider.fileOps.readString(
            this.cachedFilePath
        );

        // Throw if no cached config exists
        if (cachedJson === null || cachedJson === undefined) {
            throw new ConfigException('No cached config found');
        }

        // Parse the JSON string into a config object
        const config = new DUIConfig(JSON.parse(cachedJson));
        console.log('Loaded cached config:', config);
        // Initialize functions from the remote path with version info
        await this.provider.initFunctions({
            remotePath: config.functionsFilePath,
            version: config.version,
        });

        return config;
    }
}
