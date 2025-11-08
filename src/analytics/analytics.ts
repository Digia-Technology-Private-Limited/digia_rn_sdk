/**
 * Represents an analytics event with a name and optional payload.
 */
export class AnalyticEvent {
    /** The name/identifier of the event */
    readonly name: string;

    /** Optional payload data associated with the event */
    readonly payload?: Record<string, any>;

    /**
     * Creates a new AnalyticEvent.
     * 
     * @param options - Event configuration
     * @param options.name - The event name
     * @param options.payload - Optional event payload
     */
    constructor(options: {
        name: string;
        payload?: Record<string, any>;
    }) {
        this.name = options.name;
        this.payload = options.payload;
    }

    /**
     * Create an AnalyticEvent from JSON data.
     * 
     * @param json - The JSON object to parse
     * @returns A new AnalyticEvent instance
     */
    static fromJson(json: Record<string, any>): AnalyticEvent {
        return new AnalyticEvent({
            name: json.name as string,
            payload: json.payload as Record<string, any> | undefined,
        });
    }

    /**
     * Convert the AnalyticEvent to a JSON object.
     * 
     * @returns A plain JSON object
     */
    toJson(): Record<string, any> {
        return {
            name: this.name,
            payload: this.payload,
        };
    }
}

/**
 * Error information for data source failures.
 */
export abstract class DataSourceErrorInfo {
    /** Response data if available */
    data?: any;

    /** Request configuration/options */
    requestOptions?: any;

    /** HTTP status code if applicable */
    statusCode?: number;

    /** Error message */
    message?: string;

    /** The error object */
    error?: any;

    /**
     * Creates a new DataSourceErrorInfo.
     * 
     * @param data - Response data
     * @param requestOptions - Request configuration
     * @param statusCode - HTTP status code
     * @param error - Error object
     * @param message - Error message
     */
    constructor(
        data?: any,
        requestOptions?: any,
        statusCode?: number,
        error?: any,
        message?: string
    ) {
        this.data = data;
        this.requestOptions = requestOptions;
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
    }
}

/**
 * Error information specific to API server failures.
 */
export class ApiServerInfo extends DataSourceErrorInfo {
    /**
     * Creates a new ApiServerInfo instance.
     * 
     * @param data - Response data
     * @param requestOptions - Request configuration
     * @param statusCode - HTTP status code
     * @param error - Error object
     * @param message - Error message
     */
    constructor(
        data?: any,
        requestOptions?: any,
        statusCode?: number,
        error?: any,
        message?: string
    ) {
        super(data, requestOptions, statusCode, error, message);
    }
}

/**
 * Abstract interface for analytics tracking in Digia UI.
 * 
 * Implement this interface to integrate your own analytics solution
 * (e.g., Firebase Analytics, Mixpanel, Amplitude, etc.) with the SDK.
 * 
 * @example
 * ```typescript
 * class MyAnalytics implements DUIAnalytics {
 *   onEvent(events: AnalyticEvent[]): void {
 *     events.forEach(event => {
 *       analytics.logEvent(event.name, event.payload);
 *     });
 *   }
 * 
 *   onDataSourceSuccess(
 *     dataSourceType: string,
 *     source: string,
 *     metaData?: any,
 *     perfData?: any
 *   ): void {
 *     console.log('Data source success:', source);
 *   }
 * 
 *   onDataSourceError(
 *     dataSourceType: string,
 *     source: string,
 *     errorInfo: DataSourceErrorInfo
 *   ): void {
 *     console.error('Data source error:', source, errorInfo);
 *   }
 * }
 * ```
 */
export abstract class DUIAnalytics {
    /**
     * Called when analytics events are triggered.
     * 
     * @param events - Array of analytics events to track
     */
    abstract onEvent(events: AnalyticEvent[]): void;

    /**
     * Called when a data source request succeeds.
     * 
     * @param dataSourceType - Type of data source (e.g., 'api', 'graphql')
     * @param source - The source identifier or URL
     * @param metaData - Optional metadata about the request
     * @param perfData - Optional performance data
     */
    abstract onDataSourceSuccess(
        dataSourceType: string,
        source: string,
        metaData?: any,
        perfData?: any
    ): void;

    /**
     * Called when a data source request fails.
     * 
     * @param dataSourceType - Type of data source (e.g., 'api', 'graphql')
     * @param source - The source identifier or URL
     * @param errorInfo - Error information
     */
    abstract onDataSourceError(
        dataSourceType: string,
        source: string,
        errorInfo: DataSourceErrorInfo
    ): void;
}

/**
 * Default no-op implementation of DUIAnalytics.
 * Does nothing - useful for testing or when analytics is disabled.
 */
export class NoOpAnalytics extends DUIAnalytics {
    onEvent(_events: AnalyticEvent[]): void {
        // No-op
    }

    onDataSourceSuccess(
        _dataSourceType: string,
        _source: string,
        _metaData?: any,
        _perfData?: any
    ): void {
        // No-op
    }

    onDataSourceError(
        _dataSourceType: string,
        _source: string,
        _errorInfo: DataSourceErrorInfo
    ): void {
        // No-op
    }
}

/**
 * Console-based implementation of DUIAnalytics for debugging.
 * Logs all analytics events and data source activity to the console.
 */
export class ConsoleAnalytics extends DUIAnalytics {
    onEvent(events: AnalyticEvent[]): void {
        console.log('[Analytics] Events:', events);
    }

    onDataSourceSuccess(
        dataSourceType: string,
        source: string,
        metaData?: any,
        perfData?: any
    ): void {
        console.log('[Analytics] Data Source Success:', {
            dataSourceType,
            source,
            metaData,
            perfData,
        });
    }

    onDataSourceError(
        dataSourceType: string,
        source: string,
        errorInfo: DataSourceErrorInfo
    ): void {
        console.error('[Analytics] Data Source Error:', {
            dataSourceType,
            source,
            errorInfo,
        });
    }
}
