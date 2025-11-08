import type { DUIConfig } from '../model';

/**
 * Abstract configuration source interface.
 * 
 * Defines the contract for fetching configuration data from various sources
 * (network, local storage, bundled assets, etc.).
 * 
 * @example
 * ```typescript
 * class NetworkConfigSource extends ConfigSource {
 *   async getConfig(): Promise<DUIConfig> {
 *     const response = await fetch('/api/config');
 *     return response.json();
 *   }
 * }
 * 
 * class LocalConfigSource extends ConfigSource {
 *   async getConfig(): Promise<DUIConfig> {
 *     const data = await AsyncStorage.getItem('dui_config');
 *     return JSON.parse(data);
 *   }
 * }
 * ```
 */
export abstract class ConfigSource {
    /**
     * Retrieve the configuration data from the source.
     * 
     * @returns A promise that resolves to the complete DUIConfig object
     * @throws May throw errors if configuration cannot be loaded or parsed
     */
    abstract getConfig(): Promise<DUIConfig>;
}
