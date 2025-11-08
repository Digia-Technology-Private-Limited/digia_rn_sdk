import type { DUIConfig } from '../model';
import { ConfigSource } from './base';
import { ConfigException } from '../exception';

/**
 * Configuration source that delegates to a user-provided function.
 * 
 * This source allows consumers to provide their own custom configuration
 * loading logic by passing a function that returns a DUIConfig. Useful
 * for custom integrations or when configuration comes from non-standard
 * sources.
 * 
 * @example
 * ```typescript
 * // Custom config from API
 * const source = new DelegatedConfigSource(async () => {
 *   const response = await fetch('https://api.example.com/config');
 *   return response.json();
 * });
 * 
 * // Custom config from local database
 * const source = new DelegatedConfigSource(async () => {
 *   const db = await openDatabase();
 *   return db.getConfig();
 * });
 * 
 * const config = await source.getConfig();
 * ```
 */
export class DelegatedConfigSource implements ConfigSource {
    private readonly getConfigFn: () => Promise<DUIConfig>;

    /**
     * Creates a new DelegatedConfigSource.
     * 
     * @param getConfigFn - A function that returns a promise resolving to DUIConfig
     */
    constructor(getConfigFn: () => Promise<DUIConfig>) {
        this.getConfigFn = getConfigFn;
    }

    /**
     * Load configuration by executing the delegated function.
     * 
     * Calls the user-provided function to retrieve the configuration.
     * Wraps any errors in a ConfigException with context about the failure.
     * 
     * @returns A promise that resolves to the DUIConfig
     * @throws ConfigException if the delegated function fails
     */
    async getConfig(): Promise<DUIConfig> {
        try {
            return await this.getConfigFn();
        } catch (error) {
            throw new ConfigException(
                'Failed to execute config function',
                { originalError: error }
            );
        }
    }
}
