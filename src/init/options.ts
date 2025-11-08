import { DeveloperConfig } from '../dui_config';
import { NetworkConfiguration } from '../network/network_config';
import { Flavor } from '../init/flavor';

/// Configuration class for initializing the Digia React Native SDK.
///
/// This class contains all the necessary configuration parameters required
/// to initialize the SDK, including authentication, environment settings,
/// and optional developer configurations.
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

/// Creates a new DigiaReactNativeOptions with the specified parameters.
///
/// [accessKey] is required and should be obtained from your Digia project.
/// [flavor] specifies the environment (dev, staging, production).
/// [networkConfiguration] is optional for customizing network behavior.
export function createDigiaOptions(
  options: Omit<DigiaUIOptions, 'developerConfig'>
): DigiaUIOptions {
  return {
    ...options,
    developerConfig: new DeveloperConfig(),
  };
}

/// Creates an internal DigiaReactNativeOptions with additional developer configuration.
///
/// This function is used internally by the SDK and provides access
/// to advanced developer features and debugging tools.
export function createInternalDigiaOptions(
  options: Required<DigiaUIOptions>
): DigiaUIOptions {
  return {
    accessKey: options.accessKey,
    flavor: options.flavor,
    networkConfiguration: options.networkConfiguration,
    developerConfig: options.developerConfig,
  };
}
