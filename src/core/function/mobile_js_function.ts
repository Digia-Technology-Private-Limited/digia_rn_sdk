import type { FileOperations } from '../../utils/file_operations';
import type { FileDownloader } from '../../utils/download_operations';
import { FileOperationsImpl } from '../../utils/file_operations';
import { FileDownloaderImpl } from '../../utils/download_operations';
import { Logger } from '../../utils/logger';
import { DigiaUIManager } from '../../init/digia_ui_manager';
import { DashboardHost } from '../../dui_config';
import {
    JSFunctions,
    FunctionInitStrategy,
    PreferRemote,
    PreferLocal,
} from './js_functions';

/**
 * JavaScript runtime interface for executing JS code.
 * In React Native, this uses the built-in JavaScript context.
 */
interface JavascriptRuntime {
    evaluate(code: string): JsEvalResult;
    evaluateAsync(code: string): Promise<JsEvalResult>;
    handlePromise(result: JsEvalResult): Promise<JsEvalResult>;
}

/**
 * Result of JavaScript evaluation.
 */
interface JsEvalResult {
    isError: boolean;
    stringResult: string;
    rawResult?: any;
}

/**
 * Get or create the JavaScript runtime.
 * In React Native, we use the global JavaScript context directly.
 */
function getJavascriptRuntime(): JavascriptRuntime {
    // Store loaded functions in global scope
    if (!(global as any).__digiaJsFunctions) {
        (global as any).__digiaJsFunctions = {};
    }

    return {
        evaluate(code: string): JsEvalResult {
            try {
                // Execute the code in global scope to define functions
                // Use indirect eval to execute in global scope
                const result = (0, eval)(code);
                return {
                    isError: false,
                    stringResult: String(result),
                    rawResult: result,
                };
            } catch (error) {
                return {
                    isError: true,
                    stringResult: error instanceof Error ? error.message : String(error),
                };
            }
        },

        async evaluateAsync(code: string): Promise<JsEvalResult> {
            try {
                // Execute async code
                const result = await (0, eval)(`(async () => { return ${code}; })()`);
                return {
                    isError: false,
                    stringResult: JSON.stringify(result),
                    rawResult: result,
                };
            } catch (error) {
                return {
                    isError: true,
                    stringResult: error instanceof Error ? error.message : String(error),
                };
            }
        },

        async handlePromise(result: JsEvalResult): Promise<JsEvalResult> {
            // If result is already resolved/rejected, return it
            if (result.isError) {
                return result;
            }

            // If rawResult is a promise, wait for it
            if (result.rawResult && typeof result.rawResult.then === 'function') {
                try {
                    const resolved = await result.rawResult;
                    return {
                        isError: false,
                        stringResult: JSON.stringify(resolved),
                        rawResult: resolved,
                    };
                } catch (error) {
                    return {
                        isError: true,
                        stringResult:
                            error instanceof Error ? error.message : String(error),
                    };
                }
            }

            return result;
        },
    };
}

/**
 * Mobile implementation of JSFunctions.
 * 
 * Uses React Native's JavaScript runtime to execute dynamically loaded
 * JavaScript functions. Supports both remote and local function loading.
 * 
 * @example
 * ```typescript
 * const jsFunctions = new MobileJsFunctions();
 * 
 * // Initialize from remote
 * await jsFunctions.initFunctions(
 *   new PreferRemote('https://api.example.com/functions.js', 1)
 * );
 * 
 * // Call function
 * const result = jsFunctions.callJs('formatPrice', { amount: 100 });
 * ```
 */
export class MobileJsFunctions implements JSFunctions {
    private readonly fileOps: FileOperations = new FileOperationsImpl();
    private readonly downloadOps: FileDownloader = new FileDownloaderImpl();
    private runtime: JavascriptRuntime = getJavascriptRuntime();
    private jsFile: string = '';

    /**
     * Initialize JavaScript functions using the specified strategy.
     * 
     * @param strategy - PreferRemote or PreferLocal strategy
     * @returns Promise resolving to true if successful, false otherwise
     */
    async initFunctions(strategy: FunctionInitStrategy): Promise<boolean> {
        try {
            if (strategy instanceof PreferRemote) {
                const fileName = JSFunctions.getFunctionsFileName(strategy.version);
                const fileExists =
                    strategy.version === undefined
                        ? false
                        : await this.fileOps.exists(fileName);

                if (!fileExists) {
                    const res = await this.downloadOps.downloadFile(
                        strategy.remotePath,
                        fileName
                    );
                    if (!res) return false;
                }

                const file = await this.fileOps.readString(fileName);
                if (file === null) return false;

                this.jsFile = file;
                this.runtime.evaluate(this.jsFile);
                return true;
            } else if (strategy instanceof PreferLocal) {
                // In React Native, we'd use require() for bundled assets
                // For now, read from file system
                const file = await this.fileOps.readString(strategy.localPath);
                if (file === null) return false;

                this.jsFile = file;
                this.runtime.evaluate(this.jsFile);
                return true;
            }

            return false;
        } catch (error) {
            Logger.error('file not found', 'MobileJsFunctions', error);
            return false;
        }
    }

    /**
     * Call a synchronous JavaScript function.
     * 
     * @param fnName - Function name to call
     * @param data - Data to pass to the function
     * @returns The function result
     * @throws Error if function execution fails
     */
    callJs(fnName: string, data?: any): any {
        const input = JSON.stringify(data);
        const jsEvalResult = this.runtime.evaluate(
            `JSON.stringify(${fnName}(${input}))`
        );

        if (jsEvalResult.isError) {
            const manager = DigiaUIManager.getInstance();
            const isDashboard = manager && manager.host instanceof DashboardHost;

            if (isDashboard || __DEV__) {
                Logger.error(
                    '--------------ERROR Running Function-----------',
                    'MobileJsFunctions'
                );
                Logger.log(`functionName ---->    ${fnName}`, 'MobileJsFunctions');
                Logger.log(`input ----------> ${input}`, 'MobileJsFunctions');
                Logger.error(
                    `error -------> ${jsEvalResult.stringResult}`,
                    'MobileJsFunctions'
                );
            }

            throw new Error(
                `Error running function ${fnName}\n${jsEvalResult.stringResult}`
            );
        }

        const finalRes = JSON.parse(jsEvalResult.stringResult);
        return finalRes;
    }

    /**
     * Call an asynchronous JavaScript function.
     * 
     * @param fnName - Function name to call
     * @param data - Data to pass to the function
     * @returns Promise resolving to the function result
     * @throws Error if function execution fails
     */
    async callAsyncJs(fnName: string, data?: any): Promise<any> {
        const input = JSON.stringify(data);

        // Evaluate JS and get promise result
        const jsEvalResult = await this.runtime.evaluateAsync(`${fnName}(${input})`);

        // Handle promise properly
        const promiseResult = await this.runtime.handlePromise(jsEvalResult);

        if (promiseResult.isError) {
            const manager = DigiaUIManager.getInstance();
            const isDashboard = manager && manager.host instanceof DashboardHost;

            if (isDashboard || __DEV__) {
                Logger.error(
                    '--------------ERROR Running Function-----------',
                    'MobileJsFunctions'
                );
                Logger.log(`functionName ---->    ${fnName}`, 'MobileJsFunctions');
                Logger.log(`input ----------> ${input}`, 'MobileJsFunctions');
                Logger.error(
                    `error -------> ${promiseResult.stringResult}`,
                    'MobileJsFunctions'
                );
            }

            throw new Error(
                `Error running function ${fnName}\n${promiseResult.stringResult}`
            );
        }

        const finalRes = JSON.parse(promiseResult.stringResult);
        return finalRes;
    }
}

/**
 * Factory function to create a MobileJsFunctions instance.
 * 
 * @returns A new MobileJsFunctions instance
 */
export function getJSFunction(): JSFunctions {
    return new MobileJsFunctions();
}
