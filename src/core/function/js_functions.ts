/**
 * Strategy for initializing JavaScript functions.
 * Base class for different initialization strategies.
 */
export abstract class FunctionInitStrategy {
    abstract readonly type: 'preferRemote' | 'preferLocal';
}

/**
 * Strategy that prefers loading functions from a remote source.
 * Falls back to local if remote fails.
 */
export class PreferRemote extends FunctionInitStrategy {
    readonly type = 'preferRemote' as const;

    /** Remote path/URL to fetch functions from */
    readonly remotePath: string;

    /** Optional version number for the functions */
    readonly version?: number;

    /**
     * Creates a new PreferRemote strategy.
     * 
     * @param remotePath - Remote path to fetch functions from
     * @param version - Optional version number
     */
    constructor(remotePath: string, version?: number) {
        super();
        this.remotePath = remotePath;
        this.version = version;
    }
}

/**
 * Strategy that prefers loading functions from local storage/assets.
 */
export class PreferLocal extends FunctionInitStrategy {
    readonly type = 'preferLocal' as const;

    /** Local path to load functions from */
    readonly localPath: string;

    /**
     * Creates a new PreferLocal strategy.
     * 
     * @param localPath - Local path to load functions from
     */
    constructor(localPath: string) {
        super();
        this.localPath = localPath;
    }
}

/**
 * Abstract interface for executing JavaScript functions dynamically.
 * 
 * This allows the SDK to execute custom JavaScript functions that are
 * loaded at runtime, enabling server-driven dynamic behavior without
 * requiring app updates.
 * 
 * @example
 * ```typescript
 * const jsFunctions = new JSFunctionsImpl();
 * 
 * // Initialize with remote functions
 * await jsFunctions.initFunctions(
 *   new PreferRemote('https://api.example.com/functions.js', 1)
 * );
 * 
 * // Call synchronous function
 * const result = jsFunctions.callJs('formatPrice', { amount: 100, currency: 'USD' });
 * 
 * // Call asynchronous function
 * const asyncResult = await jsFunctions.callAsyncJs('fetchData', { id: 123 });
 * ```
 */
export abstract class JSFunctions {
    /**
     * Call a synchronous JavaScript function by name.
     * 
     * @param fnName - The name of the function to call
     * @param data - The data/arguments to pass to the function
     * @returns The result of the function execution
     */
    abstract callJs(fnName: string, data?: any): any;

    /**
     * Call an asynchronous JavaScript function by name.
     * 
     * @param fnName - The name of the function to call
     * @param data - The data/arguments to pass to the function
     * @returns A promise that resolves to the result of the function execution
     */
    abstract callAsyncJs(fnName: string, data?: any): Promise<any>;

    /**
     * Initialize JavaScript functions using the specified strategy.
     * 
     * Loads the JavaScript functions from remote or local sources
     * based on the strategy provided.
     * 
     * @param strategy - The initialization strategy (PreferRemote or PreferLocal)
     * @returns A promise that resolves to true if initialization succeeded, false otherwise
     */
    abstract initFunctions(strategy: FunctionInitStrategy): Promise<boolean>;

    /**
     * Get the filename for JavaScript functions based on version.
     * 
     * @param version - Optional version number
     * @returns The filename string (e.g., 'functions.js' or 'functions_v1.js')
     */
    static getFunctionsFileName(version?: number): string {
        return version === undefined || version === null
            ? 'functions.js'
            : `functions_v${version}.js`;
    }
}

/**
 * Factory function type for creating JSFunctions instances.
 * Allows platform-specific implementations.
 */
export type JSFunctionsFactory = () => JSFunctions;

/**
 * Default no-op implementation of JSFunctions.
 * Used when JavaScript function execution is not available or disabled.
 */
export class NoOpJSFunctions extends JSFunctions {
    callJs(_fnName: string, _data?: any): any {
        console.warn('JSFunctions not initialized - callJs is no-op');
        return undefined;
    }

    async callAsyncJs(_fnName: string, _data?: any): Promise<any> {
        console.warn('JSFunctions not initialized - callAsyncJs is no-op');
        return undefined;
    }

    async initFunctions(_strategy: FunctionInitStrategy): Promise<boolean> {
        console.warn('JSFunctions not initialized - initFunctions is no-op');
        return false;
    }
}
