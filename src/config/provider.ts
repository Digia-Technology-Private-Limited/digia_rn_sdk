import type { FileOperations } from '../utils/file_operations';
import type { FileDownloader } from '../utils/download_operations';
import type { AssetBundleOperations } from '../utils/asset_bundle_operations';
import { JsonLike } from '../framework/utils';


/**
 * Options for initializing configuration provider functions.
 */
export interface InitFunctionOptions {
    /** Remote path/URL for configuration */
    remotePath?: string;

    /** Local path for cached configuration */
    localPath?: string;

    /** Configuration version number */
    version?: number;
}

/**
 * Abstract configuration provider interface.
 * 
 * Handles fetching and caching of application configuration from
 * remote sources, with support for versioning and branch-specific configs.
 * 
 * @remarks
 * TODO: Add version to headers
 * - Why add version to header only in VERSIONED & RELEASE mode?
 * 
 * @example
 * ```typescript
 * class MyConfigProvider extends ConfigProvider {
 *   async getAppConfigFromNetwork(path: string): Promise<JsonLike | null> {
 *     const response = await fetch(path);
 *     return response.json();
 *   }
 * 
 *   async initFunctions(options: InitFunctionOptions): Promise<void> {
 *     // Setup download, file operations, etc.
 *   }
 * 
 *   addBranchName(branchName?: string): void {
 *     // Add branch to request headers or path
 *   }
 * 
 *   addVersionHeader(version: number): void {
 *     // Add version to request headers
 *   }
 * 
 *   get fileOps(): FileOperations {
 *     return this._fileOps;
 *   }
 * 
 *   get bundleOps(): AssetBundleOperations {
 *     return this._bundleOps;
 *   }
 * 
 *   get downloadOps(): FileDownloader {
 *     return this._downloadOps;
 *   }
 * }
 * ```
 */
export abstract class ConfigProvider {
    /**
     * Fetch application configuration from network.
     * 
     * @param path - The remote path or URL to fetch configuration from
     * @returns The configuration data as a JSON object, or null if failed
     */
    abstract getAppConfigFromNetwork(path: string): Promise<JsonLike | null>;

    /**
     * Initialize provider functions and dependencies.
     * 
     * Sets up file operations, download operations, and other required
     * services for configuration management.
     * 
     * @param options - Initialization options
     * @param options.remotePath - Remote path/URL for configuration
     * @param options.localPath - Local path for cached configuration
     * @param options.version - Configuration version number
     */
    abstract initFunctions(options: InitFunctionOptions): Promise<void>;

    /**
     * Add branch name to configuration requests.
     * 
     * Used for fetching branch-specific configurations in development
     * or staging environments.
     * 
     * @param branchName - The Git branch name or environment identifier
     */
    abstract addBranchName(branchName?: string): void;

    /**
     * Add version header to configuration requests.
     * 
     * @param version - The configuration version number
     * 
     * @remarks
     * TODO: Clarify why version should only be added in VERSIONED & RELEASE modes
     */
    abstract addVersionHeader(version: number): void;

    /**
     * Get the file operations utility instance.
     * 
     * @returns File operations interface for reading/writing files
     */
    abstract get fileOps(): FileOperations;

    /**
     * Get the asset bundle operations utility instance.
     * 
     * @returns Asset bundle operations interface for managing bundled assets
     */
    abstract get bundleOps(): AssetBundleOperations;

    /**
     * Get the download operations utility instance.
     * 
     * @returns File downloader interface for downloading remote files
     */
    abstract get downloadOps(): FileDownloader;
}
