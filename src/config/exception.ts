/**
 * Types of configuration errors that can occur.
 */
export enum ConfigErrorType {
    /** Network-related errors (timeout, no connection, etc.) */
    Network = 'network',

    /** File operation errors (read/write failures, missing files) */
    FileOperation = 'fileOperation',

    /** Invalid data format or parsing errors */
    InvalidData = 'invalidData',

    /** Cache-related errors */
    Cache = 'cache',

    /** Version mismatch or update issues */
    Version = 'version',

    /** Asset loading errors */
    Asset = 'asset',

    /** Unknown or unspecified errors */
    Unknown = 'unknown',
}

/**
 * Exception thrown when configuration-related operations fail.
 * 
 * Used for errors during config loading, parsing, validation, or caching.
 */
export class ConfigException extends Error {
    /** The type of configuration error */
    public readonly type: ConfigErrorType;

    /** The original error that caused this exception, if any */
    public readonly originalError?: any;

    /** The stack trace string from the original error */
    public readonly stackTraceString?: string;

    /**
     * Creates a new ConfigException.
     * 
     * @param message - Description of what went wrong
     * @param options - Optional configuration
     * @param options.type - Error type for categorization (default: Unknown)
     * @param options.originalError - The original error that caused this exception
     * @param options.stackTrace - Custom stack trace string
     */
    constructor(
        message: string,
        options: {
            type?: ConfigErrorType;
            originalError?: any;
            stackTrace?: string;
        } = {}
    ) {
        super(message);
        this.name = 'ConfigException';
        this.type = options.type ?? ConfigErrorType.Unknown;
        this.originalError = options.originalError;
        this.stackTraceString = options.stackTrace;

        // Maintains proper stack trace for where error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ConfigException);
        }
    }

    /**
     * Custom string representation of the exception.
     * 
     * @returns A formatted string with error details
     */
    toString(): string {
        let result = `ConfigException(${this.type}): ${this.message}`;

        if (this.originalError !== undefined) {
            result += `\nOriginal error: ${this.originalError}`;
        }

        if (this.stackTraceString) {
            result += `\nStack trace: ${this.stackTraceString}`;
        }

        return result;
    }

    // Factory methods for creating specific exception types

    /**
     * Create a network-related ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with Network type
     */
    static network(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.Network,
            originalError,
            stackTrace,
        });
    }

    /**
     * Create a file operation ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with FileOperation type
     */
    static fileOperation(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.FileOperation,
            originalError,
            stackTrace,
        });
    }

    /**
     * Create an invalid data ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with InvalidData type
     */
    static invalidData(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.InvalidData,
            originalError,
            stackTrace,
        });
    }

    /**
     * Create a cache-related ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with Cache type
     */
    static cache(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.Cache,
            originalError,
            stackTrace,
        });
    }

    /**
     * Create a version-related ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with Version type
     */
    static version(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.Version,
            originalError,
            stackTrace,
        });
    }

    /**
     * Create an asset-related ConfigException.
     * 
     * @param message - Error message
     * @param originalError - The original error
     * @param stackTrace - Custom stack trace
     * @returns A ConfigException with Asset type
     */
    static asset(
        message: string,
        originalError?: any,
        stackTrace?: string
    ): ConfigException {
        return new ConfigException(message, {
            type: ConfigErrorType.Asset,
            originalError,
            stackTrace,
        });
    }
}

/**
 * Exception thrown when configuration version is invalid or incompatible.
 */
export class ConfigVersionException extends ConfigException {
    /**
     * Creates a new ConfigVersionException.
     * 
     * @param message - Description of the version issue
     * @param expectedVersion - The expected/required version
     * @param actualVersion - The version that was found
     */
    constructor(
        message: string,
        public readonly expectedVersion?: number,
        public readonly actualVersion?: number
    ) {
        super(message);
        this.name = 'ConfigVersionException';
    }
}

/**
 * Exception thrown when configuration parsing fails.
 */
export class ConfigParseException extends ConfigException {
    /**
     * Creates a new ConfigParseException.
     * 
     * @param message - Description of the parsing error
     * @param invalidData - The data that failed to parse (optional)
     */
    constructor(message: string, public readonly invalidData?: any) {
        super(message);
        this.name = 'ConfigParseException';
    }
}
