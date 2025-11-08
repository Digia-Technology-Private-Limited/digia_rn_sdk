import { Environment } from '../init/environment';

/**
 * Enumeration of available flavor options for the SDK.
 */
export enum FlavorOption {
    /** Debug flavor for development with remote configuration. */
    Debug = 'debug',

    /** Staging flavor for testing with staging environment. */
    Staging = 'staging',

    /** Release flavor for production with local assets. */
    Release = 'release',

    /** Versioned flavor for loading specific configuration versions. */
    Version = 'version',
}

/**
 * Base interface for defining application flavors/environments.
 *
 * Flavors determine how the SDK loads configuration and which environment
 * it connects to. Different flavors provide different initialization strategies
 * suitable for development, testing, and production scenarios.
 */
export interface Flavor {
    /** The type of flavor being used. */
    readonly value: FlavorOption;

    /** The target environment for this flavor. */
    readonly environment: Environment;
}

/**
 * Debug flavor implementation for development environments.
 *
 * This flavor loads configuration from the server in real-time, allowing
 * for immediate testing of configuration changes during development.
 */
export interface DebugFlavor extends Flavor {
    readonly value: FlavorOption.Debug;
    /** Optional branch name to load configuration from a specific branch. */
    readonly branchName?: string;
}

/**
 * Staging flavor implementation for testing environments.
 *
 * This flavor is suitable for testing and QA environments where you want
 * production-like behavior but still need the ability to update configuration
 * remotely.
 */
export interface StagingFlavor extends Flavor {
    readonly value: FlavorOption.Staging;
}

/**
 * Versioned flavor implementation for loading specific configuration versions.
 *
 * This flavor allows you to load a specific version of your app configuration,
 * which is useful for A/B testing, rollback scenarios, or maintaining
 * consistency across different app releases.
 */
export interface VersionedFlavor extends Flavor {
    readonly value: FlavorOption.Version;
    /** The specific version number to load. */
    readonly version: number;
}

/**
 * Release flavor implementation for production deployments.
 *
 * This flavor loads configuration from local app assets rather than from
 * the network, providing optimal performance and reliability for production
 * environments.
 */
export interface ReleaseFlavor extends Flavor {
    readonly value: FlavorOption.Release;
    /** The strategy for initializing and caching configuration. */
    readonly initStrategy: DSLInitStrategy;
    /** Path to the app configuration asset file. */
    readonly appConfigPath: string;
    /** Path to the functions configuration asset file. */
    readonly functionsPath: string;
}

/**
 * Base interface for defining DSL initialization strategies.
 *
 * Different strategies determine how configuration is loaded, cached,
 * and updated in production environments.
 */
export type DSLInitStrategy =
    | NetworkFirstStrategy
    | CacheFirstStrategy
    | LocalFirstStrategy;

/**
 * Network-first initialization strategy.
 *
 * This strategy attempts to load configuration from the network first,
 * falling back to cached or local assets if the network request fails
 * or times out.
 */
export interface NetworkFirstStrategy {
    readonly type: 'network-first';
    /** The timeout duration in milliseconds for network requests. */
    readonly timeoutInMs: number;
}

/**
 * Cache-first initialization strategy.
 *
 * This strategy loads configuration from cache first, providing fast startup
 * times. Network updates happen in the background for future app launches.
 */
export interface CacheFirstStrategy {
    readonly type: 'cache-first';
}

/**
 * Local-first initialization strategy.
 *
 * This strategy loads configuration exclusively from local assets,
 * providing the fastest and most reliable startup experience.
 */
export interface LocalFirstStrategy {
    readonly type: 'local-first';
}

/**
 * Factory functions for creating flavor instances.
 */
export const Flavors = {
    /**
     * Creates a debug flavor for development with optional branch specification.
     *
     * Debug flavor loads configuration from the server in real-time, making it
     * perfect for development where you want to see changes immediately.
     */
    debug(options?: {
        branchName?: string;
        environment?: Environment;
    }): DebugFlavor {
        return {
            value: FlavorOption.Debug,
            environment: options?.environment ?? Environment.production,
            branchName: options?.branchName,
        };
    },

    /**
     * Creates a staging flavor for testing environments.
     *
     * Staging flavor is useful for testing with production-like configuration
     * while still having the ability to update remotely.
     */
    staging(options?: { environment?: Environment }): StagingFlavor {
        return {
            value: FlavorOption.Staging,
            environment: options?.environment ?? Environment.production,
        };
    },

    /**
     * Creates a versioned flavor for loading specific configuration versions.
     *
     * Versioned flavor allows you to load a specific version of your app
     * configuration, useful for A/B testing or rollback scenarios.
     */
    versioned(options: {
        version: number;
        environment?: Environment;
    }): VersionedFlavor {
        return {
            value: FlavorOption.Version,
            environment: options.environment ?? Environment.production,
            version: options.version,
        };
    },

    /**
     * Creates a release flavor for production deployment with local assets.
     *
     * Release flavor loads configuration from local app assets rather than
     * from the network, providing the best performance and reliability for
     * production deployments.
     */
    release(options: {
        initStrategy: DSLInitStrategy;
        appConfigPath: string;
        functionsPath: string;
    }): ReleaseFlavor {
        return {
            value: FlavorOption.Release,
            environment: Environment.production,
            initStrategy: options.initStrategy,
            appConfigPath: options.appConfigPath,
            functionsPath: options.functionsPath,
        };
    },
};

/**
 * Factory functions for creating DSL initialization strategies.
 */
export const InitStrategies = {
    /**
     * Creates a network-first strategy with the specified timeout.
     */
    networkFirst(timeoutInMs: number): NetworkFirstStrategy {
        return {
            type: 'network-first',
            timeoutInMs,
        };
    },

    /**
     * Creates a cache-first strategy.
     */
    cacheFirst(): CacheFirstStrategy {
        return {
            type: 'cache-first',
        };
    },

    /**
     * Creates a local-first strategy.
     */
    localFirst(): LocalFirstStrategy {
        return {
            type: 'local-first',
        };
    },
};