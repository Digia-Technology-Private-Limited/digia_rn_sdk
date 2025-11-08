import type { DUIConfig } from '../model';
import { ConfigSource } from './base';
import { ConfigException } from '../exception';

/**
 * Options for creating a FallbackConfigSource.
 */
export interface FallbackConfigSourceOptions {
    /** The primary configuration source to try first */
    primary: ConfigSource;

    /** Array of fallback sources to try if primary fails */
    fallback?: ConfigSource[];
}

/**
 * Configuration source that tries multiple sources in order.
 * 
 * This source attempts to load configuration from a primary source first.
 * If that fails, it tries each fallback source in order until one succeeds.
 * Useful for implementing offline-first patterns or graceful degradation.
 * 
 * @example
 * ```typescript
 * const networkSource = new NetworkConfigSource(provider, 'https://api.example.com/config');
 * const cacheSource = new CachedConfigSource(provider, '/cache/config.json');
 * const assetSource = new AssetConfigSource(provider, 'assets/config.json', 'assets/functions.json');
 * 
 * const source = new FallbackConfigSource({
 *   primary: networkSource,
 *   fallback: [cacheSource, assetSource]
 * });
 * 
 * // Will try network first, then cache, then bundled assets
 * const config = await source.getConfig();
 * ```
 */
export class FallbackConfigSource implements ConfigSource {
    private readonly primary: ConfigSource;
    private readonly fallback: ConfigSource[];

    /**
     * Creates a new FallbackConfigSource.
     * 
     * @param options - Configuration options
     * @param options.primary - The primary source to try first
     * @param options.fallback - Array of fallback sources (default: empty array)
     */
    constructor(options: FallbackConfigSourceOptions) {
        this.primary = options.primary;
        this.fallback = options.fallback ?? [];
    }

    /**
     * Load configuration with fallback support.
     * 
     * Attempts to load from the primary source first. If that fails,
     * tries each fallback source in order until one succeeds. Throws
     * an exception only if all sources fail.
     * 
     * @returns A promise that resolves to the DUIConfig from the first successful source
     * @throws ConfigException if all sources (primary and fallbacks) fail
     */
    async getConfig(): Promise<DUIConfig> {
        // Try primary source first
        try {
            return await this.primary.getConfig();
        } catch (error) {
            // Primary failed, try fallback sources
            for (const source of this.fallback) {
                try {
                    return await source.getConfig();
                } catch (_) {
                    // Continue to next fallback
                    continue;
                }
            }

            // All sources failed
            throw new ConfigException('All config sources failed');
        }
    }
}
