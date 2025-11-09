import { JsonLike } from '../../framework/utils';
import { DUIConfig } from '../model';
import type { ConfigProvider } from '../provider';
import { ConfigSource } from './base';

/**
 * Configuration source that loads config from bundled assets.
 * 
 * This source reads the configuration from assets bundled with the
 * application at build time. Useful for offline-first apps or
 * when you want to ship a default configuration.
 * 
 * @example
 * ```typescript
 * const provider = new MyConfigProvider();
 * const source = new AssetConfigSource(
 *   provider,
 *   'config/app-config.json',
 *   'config/functions.json'
 * );
 * 
 * const config = await source.getConfig();
 * ```
 */
export class AssetConfigSource implements ConfigSource {
    private readonly provider: ConfigProvider;
    private readonly appConfigPath: string;
    private readonly functionsPath: string;

    /**
     * Creates a new AssetConfigSource.
     * 
     * @param provider - The configuration provider with bundleOps support
     * @param appConfigPath - Path to the bundled app configuration file
     * @param functionsPath - Path to the bundled functions configuration file
     */
    constructor(
        provider: ConfigProvider,
        appConfigPath: string,
        functionsPath: string
    ) {
        this.provider = provider;
        this.appConfigPath = appConfigPath;
        this.functionsPath = functionsPath;
    }

    /**
     * Load configuration from bundled assets.
     * 
     * Reads the configuration JSON from the bundled assets and parses it
     * into a DUIConfig object. Also initializes functions from the
     * bundled functions path.
     * 
     * @returns A promise that resolves to the parsed DUIConfig
     * @throws Error if the asset cannot be read or parsed
     */
    async getConfig(): Promise<DUIConfig> {
        // Read the bundled configuration file as a string
        const burnedJson = await this.provider.bundleOps.readString(
            this.appConfigPath
        );

        // Parse the JSON string into a config object
        const configData = JSON.parse(burnedJson) as JsonLike;
        console.log('Loaded config from assets:', configData);
        // Initialize functions from the bundled path
        await this.provider.initFunctions({
            localPath: this.functionsPath,
        });

        // Return the parsed config data as DUIConfig
        // Note: In TypeScript, we trust the JSON structure matches DUIConfig
        return new DUIConfig(configData);
    }
}
