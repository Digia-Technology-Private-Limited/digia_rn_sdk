import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, CancelToken } from 'axios';
import { Platform } from 'react-native';
import { HttpMethod, BodyType, BodyTypeHelper } from './types';
import { BaseResponse } from './api_response/base_response';
import { NetworkConfiguration } from './network_config';
import { DeveloperConfig } from '../dui_config';

/**
 * Configures developer-specific options for the Axios HTTP client.
 *
 * This function sets up proxy configuration for debugging and development
 * purposes. When a proxy URL is provided in debug mode, it configures
 * the HTTP client to route requests through the specified proxy server.
 *
 * @param instance - The Axios instance to configure
 * @param developerConfig - Developer configuration containing proxy settings
 *
 * The configuration only applies in debug mode and on non-web platforms
 * to avoid affecting production builds or web deployments.
 */
function configureDeveloperOptions(
    instance: AxiosInstance,
    developerConfig?: DeveloperConfig
): void {
    if (!developerConfig) {
        return;
    }

    // Proxy configuration is typically handled at the native level in React Native
    // or through environment configuration. This is a placeholder for custom logic.
    if (__DEV__ && Platform.OS !== 'web' && developerConfig.proxyUrl) {
        // Note: Axios proxy configuration works differently in React Native
        // You may need to configure this at the native level or use a custom adapter
        if (developerConfig.inspector) {
            developerConfig.inspector.log?.(
                `Proxy configured: ${developerConfig.proxyUrl}`,
                'NetworkClient'
            );
        }
    }
}

/**
 * Creates an Axios instance configured for Digia internal API requests.
 *
 * This instance is used for communication with Digia Studio backend
 * services and includes proper authentication headers and base configuration.
 *
 * @param baseUrl - The base URL for Digia API requests
 * @param headers - Authentication and metadata headers
 * @param developerConfig - Optional developer configuration for debugging
 * @returns A configured Axios instance ready for Digia API communication
 */
function createDigiaAxios(
    baseUrl: string,
    headers: Record<string, any>,
    developerConfig?: DeveloperConfig
): AxiosInstance {
    const instance = axios.create({
        baseURL: baseUrl,
        timeout: 1000000,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    });

    configureDeveloperOptions(instance, developerConfig);
    return instance;
}

/**
 * Creates an Axios instance configured for project-specific API requests.
 *
 * This instance is used for making requests to the project's own APIs
 * as defined in the Digia Studio configuration. It uses project-specific
 * timeouts, headers, and other configurations.
 *
 * @param projectNetworkConfiguration - Network configuration from project settings
 * @param developerConfig - Optional developer configuration for debugging
 * @returns A configured Axios instance ready for project API communication
 */
function createProjectAxios(
    projectNetworkConfiguration: NetworkConfiguration,
    developerConfig?: DeveloperConfig
): AxiosInstance {
    const instance = axios.create({
        timeout: projectNetworkConfiguration.timeoutInMs,
        headers: {
            ...projectNetworkConfiguration.defaultHeaders,
        },
    });

    configureDeveloperOptions(instance, developerConfig);
    return instance;
}

/**
 * Network client for handling HTTP requests in the Digia UI system.
 *
 * NetworkClient manages two separate Axios instances for different types of requests:
 * 1. **Digia Instance**: For internal Digia Studio API communication
 * 2. **Project Instance**: For project-specific API requests
 *
 * This separation allows for different configurations, headers, and policies
 * for internal vs. external API calls. The client handles authentication,
 * request/response interceptors, and error handling.
 *
 * Key features:
 * - **Dual HTTP Clients**: Separate instances for Digia and project APIs
 * - **Header Management**: Automatic header handling and merging
 * - **Developer Tools**: Integration with debugging and inspection tools
 * - **Multipart Support**: File upload capabilities with progress tracking
 * - **Error Handling**: Structured error responses and exception handling
 *
 * @example
 * ```typescript
 * const client = new NetworkClient(
 *   baseUrl,
 *   digiaHeaders,
 *   projectNetworkConfig,
 *   developerConfig
 * );
 *
 * // Make project API request
 * const response = await client.requestProject({
 *   bodyType: BodyType.JSON,
 *   url: '/api/users',
 *   method: HttpMethod.GET,
 * });
 * ```
 */
export class NetworkClient {
    /** Axios instance configured for Digia internal API requests */
    private digiaAxiosInstance: AxiosInstance;

    /** Axios instance configured for project-specific API requests */
    private projectAxiosInstance: AxiosInstance;

    /**
     * Creates a new NetworkClient with dual HTTP client configuration.
     *
     * @param baseUrl - Base URL for Digia internal API requests
     * @param digiaHeaders - Headers for authenticating with Digia services
     * @param projectNetworkConfiguration - Configuration for project APIs
     * @param developerConfig - Optional configuration for debugging and development
     *
     * The constructor sets up both Axios instances and configures debugging
     * interceptors if provided in the developer configuration.
     *
     * @throws Error if the base URL is empty or invalid
     */
    constructor(
        baseUrl: string,
        digiaHeaders: Record<string, any>,
        projectNetworkConfiguration: NetworkConfiguration,
        developerConfig?: DeveloperConfig
    ) {
        // Validate base URL
        if (!baseUrl || baseUrl.trim() === '') {
            throw new Error('Invalid BaseUrl');
        }

        this.digiaAxiosInstance = createDigiaAxios(baseUrl, digiaHeaders, developerConfig);
        this.projectAxiosInstance = createProjectAxios(
            projectNetworkConfiguration,
            developerConfig
        );

        // Add request/response interceptors for logging if inspector is provided
        if (developerConfig?.inspector) {
            this.projectAxiosInstance.interceptors.request.use(
                (config) => {
                    developerConfig.inspector?.logRequest?.(
                        config.url || '',
                        config.method?.toUpperCase() || 'GET',
                        config.data
                    );
                    return config;
                },
                (error) => {
                    developerConfig.inspector?.error('Request Error', error);
                    return Promise.reject(error);
                }
            );

            this.projectAxiosInstance.interceptors.response.use(
                (response) => {
                    developerConfig.inspector?.logResponse?.(
                        response.config.url || '',
                        response.status,
                        response.data
                    );
                    return response;
                },
                (error) => {
                    developerConfig.inspector?.error('Response Error', error);
                    return Promise.reject(error);
                }
            );
        }
    }

    /**
     * Makes an HTTP request using the project-configured Axios instance.
     *
     * This method is used for all API requests to project-specific endpoints
     * as defined in the Digia Studio configuration. It handles header merging,
     * content type configuration, and request execution.
     *
     * @param options - Request configuration
     * @param options.bodyType - The content type for the request body
     * @param options.url - The endpoint URL (relative to project base URL)
     * @param options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param options.additionalHeaders - Optional headers to add to the request
     * @param options.cancelToken - Optional token for request cancellation
     * @param options.data - Request body data
     * @param options.apiName - Optional API name for enhanced logging
     * @returns An AxiosResponse containing the server response
     */
    async requestProject(options: {
        bodyType: BodyType;
        url: string;
        method: HttpMethod;
        additionalHeaders?: Record<string, any>;
        cancelToken?: CancelToken;
        data?: any;
        apiName?: string;
    }): Promise<AxiosResponse> {
        const { bodyType, url, method, additionalHeaders, cancelToken, data, apiName } = options;

        // Remove headers already in base headers to avoid conflicts
        const filteredHeaders = { ...additionalHeaders };
        if (additionalHeaders) {
            const baseHeaderKeys = Object.keys(this.projectAxiosInstance.defaults.headers.common || {});
            baseHeaderKeys.forEach((key) => {
                if (key.toLowerCase() in filteredHeaders) {
                    delete filteredHeaders[key];
                }
            });
        }

        // Merge headers with content type
        const headers = {
            ...filteredHeaders,
            'Content-Type': BodyTypeHelper.getContentTypeHeader(bodyType),
        };

        const config: AxiosRequestConfig = {
            url,
            method,
            headers,
            data,
            cancelToken,
        };

        if (apiName) {
            // Store apiName in config for logging/debugging
            (config as any).apiName = apiName;
        }

        return this.projectAxiosInstance.request(config);
    }

    /**
     * Internal method for executing requests with the Digia Axios instance.
     *
     * @param path - API endpoint path
     * @param method - HTTP method
     * @param data - Optional request body data
     * @param headers - Optional additional headers
     * @returns An AxiosResponse with the server response
     */
    private async _execute<T = any>(
        path: string,
        method: HttpMethod,
        data?: any,
        headers?: Record<string, any>
    ): Promise<AxiosResponse<T>> {
        return this.digiaAxiosInstance.request<T>({
            url: path,
            method,
            data,
            headers,
        });
    }

    /**
     * Makes a structured request to Digia internal APIs with response parsing.
     *
     * This method provides a higher-level interface for internal API requests
     * with automatic response parsing and error handling. It returns a structured
     * BaseResponse that indicates success/failure and contains parsed data.
     *
     * @param method - HTTP method for the request
     * @param path - API endpoint path
     * @param fromJsonT - Function to deserialize response data to type T
     * @param data - Optional request body data
     * @param headers - Optional additional headers
     * @returns A BaseResponse<T> containing the parsed response or error information
     */
    async requestInternal<T>(
        method: HttpMethod,
        path: string,
        fromJsonT: (json: any) => T,
        data?: any,
        headers: Record<string, any> = {}
    ): Promise<BaseResponse<T>> {
        try {
            const response = await this._execute(path, method, data, headers);

            const code = response.status;
            if (code >= 200 && code < 300) {
                return BaseResponse.fromJson<T>(response.data as Record<string, any>, fromJsonT);
            } else {
                return BaseResponse.failure<T>({
                    code: response.status,
                    message: response.statusText,
                });
            }
        } catch (e: any) {
            throw new Error(`Error making HTTP request: ${e.message || e}`);
        }
    }

    /**
     * Replaces all headers for project API requests.
     *
     * This method completely replaces the current header configuration
     * for the project Axios instance.
     *
     * @param headers - New headers to set for all future project requests
     *
     * Warning: This replaces ALL headers, including default ones.
     */
    replaceProjectHeaders(headers: Record<string, string>): void {
        this.projectAxiosInstance.defaults.headers.common = headers;
    }

    /**
     * Adds a version header to Digia internal API requests.
     *
     * @param version - The project configuration version number
     */
    addVersionHeader(version: number): void {
        this.digiaAxiosInstance.defaults.headers.common['x-digia-project-version'] = version;
    }

    /**
     * Creates the standard headers required for Digia internal API authentication.
     *
     * @param packageVersion - Version of the Digia UI SDK
     * @param accessKey - Project access key for authentication
     * @param platform - Platform identifier (iOS, Android, Web)
     * @param uuid - Device or installation unique identifier
     * @param packageName - App package/bundle identifier
     * @param appVersion - Application version string
     * @param appBuildNumber - Application build number
     * @param environment - Environment identifier (dev, staging, prod)
     * @param buildSignature - Optional build signature for verification
     * @returns A map of header names to values ready for HTTP requests
     */
    static getDefaultDigiaHeaders(
        packageVersion: string,
        accessKey: string,
        platform: string,
        uuid: string | null,
        packageName: string,
        appVersion: string,
        appBuildNumber: string,
        environment: string,
        buildSignature?: string
    ): Record<string, string> {
        const headers: Record<string, string> = {
            'x-digia-version': packageVersion,
            'x-digia-project-id': accessKey,
            'x-digia-platform': platform,
            'x-app-package-name': packageName,
            'x-app-version': appVersion,
            'x-app-build-number': appBuildNumber,
            'x-digia-environment': environment,
        };

        if (uuid) {
            headers['x-digia-device-id'] = uuid;
        }

        if (buildSignature && buildSignature.trim() !== '') {
            headers['x-app-signature'] = buildSignature;
        }

        return headers;
    }

    /**
     * Makes a multipart HTTP request for file uploads with progress tracking.
     *
     * @param options - Request configuration
     * @param options.bodyType - Content type for the multipart request
     * @param options.url - Upload endpoint URL
     * @param options.method - HTTP method (typically POST or PUT)
     * @param options.additionalHeaders - Optional headers to add to the request
     * @param options.data - Multipart form data (typically FormData)
     * @param options.uploadProgress - Callback function to track upload progress
     * @param options.cancelToken - Optional token for request cancellation
     * @param options.apiName - Optional API name for enhanced logging
     * @returns An AxiosResponse containing the server response after upload completion
     */
    async multipartRequestProject(options: {
        bodyType: BodyType;
        url: string;
        method: HttpMethod;
        additionalHeaders?: Record<string, any>;
        data?: any;
        uploadProgress: (sent: number, total: number) => void;
        cancelToken?: CancelToken;
        apiName?: string;
    }): Promise<AxiosResponse> {
        const {
            bodyType,
            url,
            method,
            additionalHeaders,
            data,
            uploadProgress,
            cancelToken,
            apiName,
        } = options;

        // Remove headers already in base headers to avoid conflicts
        const filteredHeaders = { ...additionalHeaders };
        if (additionalHeaders) {
            const baseHeaderKeys = Object.keys(this.projectAxiosInstance.defaults.headers.common || {});
            baseHeaderKeys.forEach((key) => {
                if (key.toLowerCase() in filteredHeaders) {
                    delete filteredHeaders[key];
                }
            });
        }

        // Merge headers with content type
        const headers = {
            ...filteredHeaders,
            'Content-Type': BodyTypeHelper.getContentTypeHeader(bodyType),
        };

        const config: AxiosRequestConfig = {
            url,
            method,
            headers,
            data,
            cancelToken,
            timeout: 0, // Remove timeout for large uploads
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    uploadProgress(progressEvent.loaded, progressEvent.total);
                }
            },
        };

        if (apiName) {
            (config as any).apiName = apiName;
        }

        return this.projectAxiosInstance.request(config);
    }
}
