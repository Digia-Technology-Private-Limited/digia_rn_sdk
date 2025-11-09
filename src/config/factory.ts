import type { Flavor, DebugFlavor, StagingFlavor, VersionedFlavor, ReleaseFlavor } from '../init/flavor';
import { FlavorOption } from '../init/flavor';
import type { ConfigProvider } from './provider';
import type { ConfigSource } from './source/base';
import { NetworkConfigSource } from './source/network';
import { NetworkFileConfigSource } from './source/network_file';
import { AssetConfigSource } from './source/asset';
import { CachedConfigSource } from './source/cache';
import { DelegatedConfigSource } from './source/delegated';
import type { DUIConfig } from './model';

/**
 * Factory for creating appropriate configuration sources based on flavor.
 * 
 * This factory encapsulates the logic for determining which configuration
 * loading strategy to use based on the app's flavor (debug, staging, release, etc.).
 * 
 * @example
 * ```typescript
 * const source = ConfigStrategyFactory.createStrategy(flavor, provider);
 * const config = await source.getConfig();
 * ```
 */
export class ConfigStrategyFactory {
    /**
     * Creates a configuration source based on the provided flavor.
     * 
     * @param flavor - The application flavor/environment
     * @param provider - The configuration provider
     * @returns A ConfigSource implementation appropriate for the flavor
     */
    static createStrategy(
        flavor: Flavor,
        provider: ConfigProvider
    ): ConfigSource {
        switch (flavor.value) {
            case FlavorOption.Debug:
                return createDebugConfigSource(provider, (flavor as DebugFlavor).branchName);

            case FlavorOption.Staging:
                return new NetworkConfigSource({
                    provider,
                    networkPath: '/config/getAppConfigStaging',
                });

            case FlavorOption.Version:
                return createVersionedSource(provider, (flavor as VersionedFlavor).version);

            case FlavorOption.Release:
                const releaseFlavor = flavor as ReleaseFlavor;
                // TODO: Check if running on web platform
                // For now, assume mobile/native
                return createReleaseFlavorConfigSource(
                    provider,
                    releaseFlavor.initStrategy,
                    releaseFlavor.appConfigPath,
                    releaseFlavor.functionsPath
                );

            default:
                throw new Error(`Unknown flavor type: ${flavor.value}`);
        }
    }
}

/**
 * Creates a versioned configuration source.
 * 
 * Sets the version header on the provider and returns a network source
 * configured to fetch the specific version.
 * 
 * @param provider - The configuration provider
 * @param version - The configuration version number
 * @returns A NetworkConfigSource configured for the version
 */
function createVersionedSource(
    provider: ConfigProvider,
    version: number
): ConfigSource {
    provider.addVersionHeader(version);
    return new NetworkConfigSource({
        provider,
        networkPath: '/config/getAppConfigForVersion',
    });
}

/**
 * Creates a debug configuration source.
 * 
 * Sets the branch name on the provider and returns a network source
 * configured for debug mode.
 * 
 * @param provider - The configuration provider
 * @param branchName - Optional branch name for branch-specific configs
 * @returns A NetworkConfigSource configured for debug mode
 */
function createDebugConfigSource(
    provider: ConfigProvider,
    branchName?: string
): ConfigSource {
    provider.addBranchName(branchName);
    return new NetworkConfigSource({
        provider,
        networkPath: '/config/getAppConfig',
    });
}

/**
 * Creates a release flavor configuration source.
 * 
 * Implements different loading strategies based on the DSLInitStrategy:
 * - NetworkFirst: Try network with timeout, fall back to cache or assets
 * - CacheFirst: Load from cache/assets, update in background
 * - LocalFirst: Load only from local assets
 * 
 * @param provider - The configuration provider
 * @param priority - The initialization strategy
 * @param appConfigPath - Path to the app configuration asset
 * @param functionsPath - Path to the functions asset
 * @returns A ConfigSource implementing the specified strategy
 */
function createReleaseFlavorConfigSource(
    provider: ConfigProvider,
    priority: any, // DSLInitStrategy type
    appConfigPath: string,
    functionsPath: string
): ConfigSource {
    switch (priority.type) {
        case 'network-first':
            return new DelegatedConfigSource(async () => {
                // Load burned-in (bundled) config
                const burnedSource = new AssetConfigSource(
                    provider,
                    appConfigPath,
                    functionsPath
                );
                const burnedConfig = await burnedSource.getConfig();
                let config: DUIConfig = burnedConfig;

                // Try to load cached config
                try {
                    const cachedSource = new CachedConfigSource(
                        provider,
                        'appConfig.json'
                    );
                    const cachedConfig = await cachedSource.getConfig();

                    // Use cached if it's newer
                    if (
                        cachedConfig.version !== undefined &&
                        burnedConfig.version !== undefined &&
                        cachedConfig.version >= burnedConfig.version
                    ) {
                        config = cachedConfig;
                    } else {
                        // Delete outdated cache
                        await provider.fileOps.delete('appConfig.json');
                    }
                } catch {
                    // Ignore cache errors, use burned config
                }

                // Set version header if available
                if (config.version !== undefined && config.version !== null) {
                    provider.addVersionHeader(config.version);
                }

                // Try to fetch latest from network
                try {
                    const networkFileSource = new NetworkFileConfigSource({
                        provider,
                        networkPath: '/config/getAppConfigRelease',
                        timeout: priority.timeoutInMs,
                    });
                    config = await networkFileSource.getConfig();
                } catch {
                    // Network failed, use what we have (cache or burned)
                }

                return config;
            });

        case 'cache-first':
            return new DelegatedConfigSource(async () => {
                // Load burned-in (bundled) config
                const burnedSource = new AssetConfigSource(
                    provider,
                    appConfigPath,
                    functionsPath
                );
                const burnedConfig = await burnedSource.getConfig();
                let configToUse: DUIConfig = burnedConfig;

                // Try to load cached config
                try {
                    const cachedSource = new CachedConfigSource(
                        provider,
                        'appConfig.json'
                    );
                    const cachedConfig = await cachedSource.getConfig();

                    // Use cached if it's newer
                    if (
                        cachedConfig.version !== undefined &&
                        burnedConfig.version !== undefined &&
                        cachedConfig.version >= burnedConfig.version
                    ) {
                        configToUse = cachedConfig;
                    } else {
                        // Delete outdated cache
                        await provider.fileOps.delete('appConfig.json');
                    }
                } catch {
                    // Ignore cache errors, use burned config
                }

                // Fire and forget: update cache in background for next app launch
                new NetworkFileConfigSource({
                    provider,
                    networkPath: '/config/getAppConfigRelease',
                })
                    .getConfig()
                    .catch(() => {
                        // Silently fail background update
                    });

                return configToUse;
            });

        case 'local-first':
            return new AssetConfigSource(
                provider,
                appConfigPath,
                functionsPath
            );

        default:
            throw new Error(`Unknown init strategy type: ${priority.type}`);
    }
}
