import type { JSFunctions } from '../core/function/js_functions';
import { PreferRemote, PreferLocal } from '../core/function/js_functions';
import { as$ } from '../framework/utils/functional_utils';
import type { Flavor } from '../init/flavor';
import { HttpMethod } from '../network/types';
import type { NetworkClient } from '../network/network_client';
import type { AssetBundleOperations } from '../utils/asset_bundle_operations';
import { AssetBundleOperationsImpl } from '../utils/asset_bundle_operations';
import type { FileOperations } from '../utils/file_operations';
import { FileOperationsImpl } from '../utils/file_operations';
import type { FileDownloader } from '../utils/download_operations';
import { FileDownloaderImpl } from '../utils/download_operations';
import { ConfigException } from './exception';
import type { ConfigSource } from './source/base';
import { DUIConfig } from './model';
import type { ConfigProvider, JsonLike } from './provider';

/**
 * Configuration resolver implementing the ConfigProvider interface.
 * 
 * Handles loading and resolving Digia configurations based on the
 * current flavor/environment. Manages JavaScript functions initialization
 * and provides access to utility operations.
 * 
 * @example
 * ```typescript
 * const resolver = new ConfigResolver(flavorInfo, networkClient);
 * resolver.addBranchName('feature-branch');
 * 
 * const config = await resolver.getConfig();
 * ```
 */
export class ConfigResolver implements ConfigProvider {
  private readonly flavorInfo: Flavor;
  private readonly networkClient: NetworkClient;
  private branchName?: string;
  private functions?: JSFunctions;

  /**
   * Creates a new ConfigResolver.
   * 
   * @param flavorInfo - The flavor/environment configuration
   * @param networkClient - The network client for API requests
   */
  constructor(flavorInfo: Flavor, networkClient: NetworkClient) {
    this.flavorInfo = flavorInfo;
    this.networkClient = networkClient;
  }

  /**
   * Fetch app configuration from the network.
   * 
   * Makes a POST request to the specified path with the current branch name
   * to retrieve the application configuration.
   * 
   * @param path - The API path to fetch configuration from
   * @returns The configuration data as a JSON object, or null if failed
   */
  async getAppConfigFromNetwork(path: string): Promise<JsonLike | null> {
    const resp = await this.networkClient.requestInternal<any>(
      HttpMethod.POST,
      path,
      (json: any) => json,
      { branchName: this.branchName }
    );

    const data = as$<JsonLike>(resp.data?.response, (v): v is JsonLike =>
      typeof v === 'object' && v !== null && !Array.isArray(v)
    );

    return data;
  }

  /**
   * Initialize JavaScript functions using remote or local strategy.
   * 
   * @param options - Initialization options
   * @param options.remotePath - Remote path to fetch functions from
   * @param options.localPath - Local path to load functions from
   * @param options.version - Version number for remote functions
   * @throws ConfigException if function initialization fails
   */
  async initFunctions(options: {
    remotePath?: string;
    localPath?: string;
    version?: number;
  }): Promise<void> {
    // Lazy initialize functions
    if (!this.functions) {
      // Import dynamically to avoid circular dependencies
      const { getJSFunction } = await import(
        '../core/function/mobile_js_function'
      );
      this.functions = getJSFunction();
    }

    if (options.remotePath !== undefined) {
      const res = await this.functions.initFunctions(
        new PreferRemote(options.remotePath, options.version)
      );
      if (!res) {
        throw new ConfigException('Functions not initialized');
      }
    }

    if (options.localPath !== undefined) {
      const res = await this.functions.initFunctions(
        new PreferLocal(options.localPath)
      );
      if (!res) {
        throw new ConfigException('Functions not initialized');
      }
    }
  }

  /**
   * Get the complete application configuration.
   * 
   * Uses the appropriate strategy based on the current flavor to
   * load the configuration from the correct source (network, cache, or assets).
   * 
   * @returns The complete DUIConfig instance with JavaScript functions attached
   */
  async getConfig(): Promise<DUIConfig> {
    // TODO: Implement ConfigStrategyFactory to determine the correct source
    // For now, throw an error indicating it needs implementation
    throw new ConfigException(
      'ConfigStrategyFactory not yet implemented. Use specific config sources directly.'
    );
  }

  /**
   * Add version header to network requests.
   * 
   * @param version - The configuration version number
   */
  addVersionHeader(version: number): void {
    this.networkClient.addVersionHeader(version);
  }

  /**
   * Get the asset bundle operations utility.
   */
  get bundleOps(): AssetBundleOperations {
    return new AssetBundleOperationsImpl();
  }

  /**
   * Get the file operations utility.
   */
  get fileOps(): FileOperations {
    return new FileOperationsImpl();
  }

  /**
   * Get the download operations utility.
   */
  get downloadOps(): FileDownloader {
    return new FileDownloaderImpl();
  }

  /**
   * Set the branch name for configuration requests.
   * 
   * Used for fetching branch-specific configurations in development
   * or staging environments.
   * 
   * @param branchName - The Git branch name or environment identifier
   */
  addBranchName(branchName?: string): void {
    this.branchName = branchName;
  }
}
