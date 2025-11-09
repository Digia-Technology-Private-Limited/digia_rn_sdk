import { DeveloperConfig } from '../dui_config';
import { NetworkConfiguration } from '../network/network_config';
import { Flavor } from '../init/flavor';

/**
 * Configuration class for initializing the Digia UI SDK.
 *
 * This class contains all the necessary configuration parameters required
 * to initialize the SDK, including authentication, environment settings,
 * and optional developer configurations.
 */
export interface DigiaUIOptions {
  /// The access key for your Digia project (required for authentication).
  accessKey: string;

  /// The environment flavor (development, staging, production).
  flavor: Flavor;

  /// Optional network configuration for customizing API behavior.
  networkConfiguration?: NetworkConfiguration;

  /// Developer configuration for debugging and advanced features.
  developerConfig?: DeveloperConfig;
}

/**
 * Implementation class for DigiaUIOptions with factory methods.
 */
export class DigiaUIOptionsImpl implements DigiaUIOptions {
  readonly accessKey: string;
  readonly flavor: Flavor;
  readonly networkConfiguration?: NetworkConfiguration;
  readonly developerConfig: DeveloperConfig;

  /**
   * Creates a new DigiaUIOptions with the specified parameters.
   *
   * @param accessKey - Required access key from your Digia project
   * @param flavor - Environment flavor (dev, staging, production)
   * @param networkConfiguration - Optional network behavior customization
   */
  constructor(options: {
    accessKey: string;
    flavor: Flavor;
    networkConfiguration?: NetworkConfiguration;
    developerConfig?: DeveloperConfig;
  }) {
    this.accessKey = options.accessKey;
    this.flavor = options.flavor;
    this.networkConfiguration = options.networkConfiguration;
    this.developerConfig = options.developerConfig ?? new DeveloperConfig();
  }

  /**
   * Creates an internal DigiaUIOptions with additional developer configuration.
   *
   * This factory method is used internally by the SDK and provides access
   * to advanced developer features and debugging tools.
   *
   * @param accessKey - Required for authentication
   * @param flavor - Specifies the environment
   * @param networkConfiguration - Optional for network customization
   * @param developerConfig - Provides access to debugging and development features
   * @returns A new DigiaUIOptions instance with developer configuration
   */
  static internal(options: {
    accessKey: string;
    flavor: Flavor;
    networkConfiguration?: NetworkConfiguration;
    developerConfig: DeveloperConfig;
  }): DigiaUIOptionsImpl {
    return new DigiaUIOptionsImpl({
      accessKey: options.accessKey,
      flavor: options.flavor,
      networkConfiguration: options.networkConfiguration,
      developerConfig: options.developerConfig,
    });
  }
}


