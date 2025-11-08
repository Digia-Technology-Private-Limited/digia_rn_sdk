/**
 * Enumeration of data types supported in Digia UI framework.
 * 
 * Defines the various data types that can be used in state management,
 * variable declarations, and component properties throughout the SDK.
 * Each type has a corresponding string identifier used in configuration.
 */
export enum DataType {
    /** String/text data type */
    String = 'string',

    /** Numeric data type (integer or float) */
    Number = 'number',

    /** Boolean data type (true/false) */
    Boolean = 'boolean',

    /** JSON object data type */
    Json = 'json',

    /** JSON array/list data type */
    JsonArray = 'list',

    /** Scroll controller for scrollable components */
    ScrollController = 'scrollController',

    /** Timer controller for time-based operations */
    TimerController = 'timerController',

    /** Stream controller for reactive data streams */
    StreamController = 'streamController',

    /** Async controller for asynchronous operations */
    AsyncController = 'asyncController',

    /** Text editing controller for text input fields */
    TextEditingController = 'textFieldController',

    /** Page controller for navigation and page management */
    PageController = 'pageController',

    /** File data type for file uploads/downloads */
    File = 'file',

    /** API cancel token for cancelling network requests */
    ApiCancelToken = 'apiCancelToken',

    /** Action data type for executable actions */
    Action = 'action',

    /** Story controller for story/carousel components */
    StoryController = 'storyController',
}

/**
 * Helper namespace for DataType operations.
 */
export namespace DataType {
    /**
     * Convert a string value to a DataType enum value.
     * 
     * @param value - The string identifier to convert
     * @returns The corresponding DataType enum value, or undefined if not found
     * 
     * @example
     * ```typescript
     * const type = DataType.fromString('string'); // DataType.String
     * const invalid = DataType.fromString('invalid'); // undefined
     * ```
     */
    export function fromString(value: any): DataType | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        // Find the enum value that matches the string
        const entries = Object.entries(DataType) as [string, string][];
        const found = entries.find(([_, val]) => val === value);

        return found ? (found[1] as DataType) : undefined;
    }

    /**
     * Get all DataType values as an array.
     * 
     * @returns Array of all DataType enum values
     */
    export function values(): DataType[] {
        return Object.values(DataType).filter(
            (value) => typeof value === 'string'
        ) as DataType[];
    }

    /**
     * Check if a value is a valid DataType.
     * 
     * @param value - The value to check
     * @returns True if the value is a valid DataType, false otherwise
     */
    export function isValid(value: any): value is DataType {
        return values().includes(value);
    }

    /**
     * Get the string identifier for a DataType.
     * 
     * @param type - The DataType enum value
     * @returns The string identifier
     */
    export function getId(type: DataType): string {
        return type;
    }
}
