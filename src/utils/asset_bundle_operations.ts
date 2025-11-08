/**
 * Abstract interface for asset bundle operations.
 * Provides access to bundled assets in the React Native app.
 */
export abstract class AssetBundleOperations {
    /**
     * Read a string from a bundled asset.
     * 
     * @param key - The asset path/key
     * @returns The asset content as a string
     */
    abstract readString(key: string): Promise<string>;
}

/**
 * Default implementation of AssetBundleOperations.
 * 
 * In React Native, assets are typically accessed via require() or imported directly.
 * This implementation provides a way to load text assets dynamically.
 * 
 * For bundled assets to work, they must be:
 * 1. Placed in the project (e.g., assets/ folder)
 * 2. Registered in react-native.config.js or metro.config.js
 * 
 * @example
 * ```typescript
 * // In your app, register assets:
 * // metro.config.js
 * module.exports = {
 *   resolver: {
 *     assetExts: ['json', 'txt', 'xml', ...],
 *   },
 * };
 * 
 * // Usage:
 * const assetOps = new AssetBundleOperationsImpl();
 * const content = await assetOps.readString('config.json');
 * ```
 */
export class AssetBundleOperationsImpl implements AssetBundleOperations {
    private assetsCache: Map<string, any> = new Map();

    /**
     * Read a string from a bundled asset.
     * 
     * Note: In React Native, assets must be statically required.
     * This implementation uses a registry pattern where assets are pre-registered.
     * 
     * To use this, call registerAsset() first with your bundled assets.
     * 
     * @param key - The asset path/key
     * @returns The asset content as a string
     * @throws Error if asset is not found or not registered
     */
    async readString(key: string): Promise<string> {
        // Check if asset is in cache
        if (this.assetsCache.has(key)) {
            const asset = this.assetsCache.get(key);
            if (typeof asset === 'string') {
                return asset;
            }
            if (typeof asset === 'object') {
                return JSON.stringify(asset);
            }
            return String(asset);
        }

        // If not in cache, throw error with helpful message
        throw new Error(
            `Asset "${key}" not found. Please register assets using registerAsset() before reading them.\n` +
            `Example: assetOps.registerAsset('${key}', require('./assets/${key}'))`
        );
    }

    /**
     * Register an asset for later retrieval.
     * 
     * This is required because React Native requires static imports/requires.
     * Assets must be registered at app initialization.
     * 
     * @param key - The asset key to register
     * @param asset - The asset content (from require() or import)
     * 
     * @example
     * ```typescript
     * const assetOps = new AssetBundleOperationsImpl();
     * 
     * // Register individual assets
     * assetOps.registerAsset('config.json', require('./assets/config.json'));
     * assetOps.registerAsset('data.txt', 'some text content');
     * 
     * // Later, read the asset
     * const config = await assetOps.readString('config.json');
     * ```
     */
    registerAsset(key: string, asset: any): void {
        this.assetsCache.set(key, asset);
    }

    /**
     * Register multiple assets at once.
     * 
     * @param assets - Map of asset keys to asset content
     * 
     * @example
     * ```typescript
     * const assetOps = new AssetBundleOperationsImpl();
     * 
     * assetOps.registerAssets({
     *   'config.json': require('./assets/config.json'),
     *   'theme.json': require('./assets/theme.json'),
     *   'strings.json': require('./assets/strings.json'),
     * });
     * ```
     */
    registerAssets(assets: Record<string, any>): void {
        Object.entries(assets).forEach(([key, asset]) => {
            this.registerAsset(key, asset);
        });
    }

    /**
     * Check if an asset is registered.
     * 
     * @param key - The asset key to check
     * @returns True if the asset is registered
     */
    hasAsset(key: string): boolean {
        return this.assetsCache.has(key);
    }

    /**
     * Get all registered asset keys.
     * 
     * @returns Array of registered asset keys
     */
    getRegisteredAssets(): string[] {
        return Array.from(this.assetsCache.keys());
    }

    /**
     * Clear all registered assets.
     */
    clearAssets(): void {
        this.assetsCache.clear();
    }
}

/**
 * Global asset bundle operations instance.
 * Use this to register and access assets throughout your app.
 * 
 * @example
 * ```typescript
 * import { assetBundle } from '@digia/rn-sdk';
 * 
 * // At app initialization
 * assetBundle.registerAssets({
 *   'config.json': require('./assets/config.json'),
 *   'theme.json': require('./assets/theme.json'),
 * });
 * 
 * // Anywhere in your app
 * const config = await assetBundle.readString('config.json');
 * ```
 */
export const assetBundle = new AssetBundleOperationsImpl();

/**
 * Create a new AssetBundleOperations instance.
 * 
 * @returns A new AssetBundleOperationsImpl instance
 */
export function createAssetBundle(): AssetBundleOperations {
    return new AssetBundleOperationsImpl();
}
