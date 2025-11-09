import { Platform } from 'react-native';
import { DUIConfig } from '../config/model';
import { NetworkClient } from '../network/network_client';
import { NetworkConfiguration } from '../network/network_config';
import { DigiaUIOptions } from './options';
import { ConfigResolver } from '../config/ConfigResolver';

/**
 * Optional import for device info
 * Install with: npm install react-native-device-info
 */
let DeviceInfo: any = null;
try {
    DeviceInfo = require('react-native-device-info');
} catch (e) {
    // DeviceInfo not available - will use fallback values
}

/**
 * SDK version constant
 */
const packageVersion = '1.0.0';

/**
 * Core DigiaUI class responsible for initializing and managing the SDK.
 *
 * This class handles the initialization of the Digia UI SDK, including network
 * configuration, preferences setup, and configuration loading. It serves as
 * the main entry point for SDK setup and provides methods for runtime
 * configuration management.
 */
export class DigiaUI {
    /** The initialization configuration provided during SDK setup */
    readonly initConfig: DigiaUIOptions;

    /** The network client used for API communications */
    readonly networkClient: NetworkClient;

    /** The DSL configuration containing widget definitions and app structure */
    readonly dslConfig: DUIConfig;

    /**
     * Creates a new DigiaUI instance with the specified configurations.
     * This is a private constructor used internally after initialization.
     */
    private constructor(
        initConfig: DigiaUIOptions,
        networkClient: NetworkClient,
        dslConfig: DUIConfig
    ) {
        this.initConfig = initConfig;
        this.networkClient = networkClient;
        this.dslConfig = dslConfig;
    }

    /**
     * Initializes the Digia UI SDK with the provided configuration.
     *
     * This is the main initialization method that sets up the SDK for use.
     * It performs the following operations:
     * - Initializes shared preferences store (if needed)
     * - Creates network client with proper headers
     * - Loads configuration from the server
     * - Sets up state observers if provided
     *
     * @param options - Configuration needed for initialization
     * @returns A fully initialized DigiaUI instance ready for use
     * @throws Error if initialization fails (network errors, invalid config, etc.)
     *
     * @example
     * ```typescript
     * const digiaUI = await DigiaUI.initialize({
     *   accessKey: 'your-access-key',
     *   flavor: Flavors.debug(),
     *   networkConfiguration: NetworkConfiguration.withDefaults(),
     *   developerConfig: new DeveloperConfig({
     *     baseUrl: 'https://api.digia.tech/api/v1'
     *   })
     * });
     * ```
     */
    static async initialize(options: DigiaUIOptions): Promise<DigiaUI> {
        // Note: PreferencesStore initialization can be added here if needed
        // await PreferencesStore.instance.initialize();

        const headers = await this._createDigiaHeaders(options, '');

        const networkClient = new NetworkClient(
            options.developerConfig?.baseUrl ?? 'https://app.digia.tech/api/v1',
            headers,
            options.networkConfiguration ?? NetworkConfiguration.withDefaults(),
            options.developerConfig
        );

        const config = await new ConfigResolver(
            options.flavor,
            networkClient
        ).getConfig();

        return new DigiaUI(options, networkClient, config);
    }

    /**
     * Creates the default headers required for Digia API communication.
     *
     * This method generates headers containing SDK version, platform information,
     * app details, and authentication information.
     *
     * @param options - Configuration including access key
     * @param uuid - Optional user identifier
     * @returns A map of headers to be used with network requests
     */
    private static async _createDigiaHeaders(
        options: DigiaUIOptions,
        uuid: string | null
    ): Promise<Record<string, string>> {
        // Get app information (with fallbacks if DeviceInfo not available)
        let packageName = 'com.unknown.app';
        let appVersion = '1.0.0';
        let appBuildNumber = '1';
        let buildSignature = '';

        if (DeviceInfo) {
            try {
                packageName = await DeviceInfo.getBundleId();
                appVersion = await DeviceInfo.getVersion();
                appBuildNumber = await DeviceInfo.getBuildNumber();

                // Build signature is Android-only
                if (Platform.OS === 'android') {
                    try {
                        buildSignature = await DeviceInfo.getFingerprint();
                    } catch (e) {
                        // Fingerprint not available
                    }
                }
            } catch (e) {
                // DeviceInfo methods failed, use defaults
                console.warn('Failed to get device info, using defaults:', e);
            }
        }

        return NetworkClient.getDefaultDigiaHeaders(
            packageVersion,
            options.accessKey,
            this._getPlatform(),
            uuid,
            packageName,
            appVersion,
            appBuildNumber,
            options.flavor.environment.name,
            buildSignature
        );
    }

    /**
     * Determines the current platform for API communication.
     *
     * @returns Platform identifier string:
     * - 'ios' for iOS devices
     * - 'android' for Android devices
     * - 'mobile_web' for web or other platforms
     */
    private static _getPlatform(): string {
        if (Platform.OS === 'web') {
            return 'mobile_web';
        }

        if (Platform.OS === 'ios') {
            return 'ios';
        }

        if (Platform.OS === 'android') {
            return 'android';
        }

        return 'mobile_web';
    }
}