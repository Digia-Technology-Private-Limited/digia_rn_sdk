import { DigiaUI } from './digia_ui';
import { DigiaInspector, DigiaUIHost } from '../dui_config';
import { NetworkClient } from '../network/network_client';
import { Variable } from '../framework/data_type/variable';
import { ExprClassInstance, ExprClass, ExprCallableImpl, ASTNode } from '@digia/expr-rn';

/**
 * Singleton manager for the DigiaUI instance.
 * 
 * This class provides global access to the initialized DigiaUI instance
 * and exposes commonly used properties and methods for convenience.
 * 
 * @example
 * ```typescript
 * // Initialize
 * const digiaUI = await DigiaUI.initialize(options);
 * DigiaUIManager.getInstance().initialize(digiaUI);
 * 
 * // Access anywhere
 * const manager = DigiaUIManager.getInstance();
 * const networkClient = manager.networkClient;
 * ```
 */
export class DigiaUIManager {
    private static _instance: DigiaUIManager;
    private _digiaUI: DigiaUI | null = null;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor() { }

    /**
     * Get the singleton instance of DigiaUIManager.
     * 
     * @returns The DigiaUIManager singleton instance
     */
    static getInstance(): DigiaUIManager {
        if (!DigiaUIManager._instance) {
            DigiaUIManager._instance = new DigiaUIManager();
        }
        return DigiaUIManager._instance;
    }

    /**
     * Initialize the manager with a DigiaUI instance.
     * 
     * @param digiaUI - The initialized DigiaUI instance
     */
    initialize(digiaUI: DigiaUI): void {
        this._digiaUI = digiaUI;
    }

    /**
     * Destroy the DigiaUI instance and clear the manager.
     */
    destroy(): void {
        this._digiaUI = null;
    }

    /**
     * Get the DigiaUI instance safely (may be null if not initialized).
     * 
     * @returns The DigiaUI instance or null
     */
    get safeInstance(): DigiaUI | null {
        return this._digiaUI;
    }

    /**
     * Get the DigiaUI instance (throws if not initialized).
     * 
     * @returns The DigiaUI instance
     * @throws Error if not initialized
     */
    get instance(): DigiaUI {
        if (!this._digiaUI) {
            throw new Error('DigiaUI not initialized. Call initialize() first.');
        }
        return this._digiaUI;
    }

    /**
     * Get the access key from the configuration.
     * 
     * @returns The access key
     * @throws Error if not initialized
     */
    get accessKey(): string {
        return this.instance.initConfig.accessKey;
    }

    /**
     * Get the inspector instance if configured.
     * 
     * @returns The inspector instance or undefined
     */
    get inspector(): DigiaInspector | undefined {
        return this._digiaUI?.initConfig.developerConfig?.inspector;
    }

    /**
     * Check if inspector is enabled.
     * 
     * @returns True if inspector is configured
     */
    get isInspectorEnabled(): boolean {
        return this._digiaUI?.initConfig.developerConfig?.inspector != null;
    }

    /**
     * Get environment variables from the DSL configuration.
     * 
     * @returns Environment variables map
     * @throws Error if not initialized
     */
    get environmentVariables(): Record<string, Variable> {
        return this.instance.dslConfig.getEnvironmentVariables();
    }

    /**
     * Get the host configuration.
     * 
     * @returns The host configuration or undefined
     */
    get host(): DigiaUIHost | undefined {
        return this._digiaUI?.initConfig.developerConfig?.host;
    }

    /**
     * Get the network client instance.
     * 
     * @returns The network client
     * @throws Error if not initialized
     */
    get networkClient(): NetworkClient {
        return this.instance.networkClient;
    }

    /**
     * Check if the manager is initialized.
     * 
     * @returns True if initialized
     */
    isInitialized(): boolean {
        return this._digiaUI !== null;
    }

    /**
     * Get JavaScript variables for use in expression evaluation.
     * 
     * Provides a 'js' object with an 'eval' method that can call
     * JavaScript functions loaded via the functions file.
     * 
     * @returns Object containing JavaScript utilities compatible with Expr evaluator
     * 
     * @example
     * ```typescript
     * const jsVars = manager.jsVars;
     * // Use in expression evaluator:
     * // {{ js.eval('formatPrice', price, currency) }}
     * ```
     */
    get jsVars(): Record<string, any> {
        return {
            js: new ExprClassInstance({
                klass: new ExprClass({
                    name: 'js',
                    fields: new Map<string, any>(),
                    methods: new Map<string, ExprCallableImpl>([
                        [
                            'eval',
                            new ExprCallableImpl({
                                fn: (evaluator: any, args: any[]) => {
                                    // First argument is the function name
                                    const fnName = this._toValue<string>(evaluator, args[0]);
                                    if (!fnName) {
                                        throw new Error('Function name is required');
                                    }

                                    // Rest of the arguments are parameters to pass to the function
                                    const fnArgs = args
                                        .slice(1)
                                        .map((arg) => this._toValue(evaluator, arg));

                                    return this.safeInstance?.dslConfig.jsFunctions?.callJs(
                                        fnName,
                                        fnArgs
                                    );
                                },
                                arity: 2, // Minimum arity (function name + at least one arg)
                            }),
                        ],
                    ]),
                }),
            }),
        };
    }

    /**
     * Helper method to extract values from expression AST nodes.
     * 
     * If the object is an ASTNode (from the expression evaluator),
     * it evaluates it to get the actual value. Otherwise, returns the object as-is.
     * 
     * @param evaluator - The expression evaluator instance
     * @param obj - The object to extract value from
     * @returns The extracted value
     */
    private _toValue<T = any>(evaluator: any, obj: any): T | undefined {
        if (obj && typeof obj === 'object' && 'type' in obj) {
            // Assume it's an ASTNode if it has a 'type' property
            const result = evaluator.eval(obj);
            return result as T | undefined;
        }

        return obj as T | undefined;
    }
}

/**
 * Convenience function to get the DigiaUIManager singleton instance.
 * 
 * @returns The DigiaUIManager singleton
 * 
 * @example
 * ```typescript
 * import { getDigiaUIManager } from '@digia/rn-sdk';
 * 
 * const manager = getDigiaUIManager();
 * if (manager.isInitialized()) {
 *   console.log('Access Key:', manager.accessKey);
 * }
 * ```
 */
export function getDigiaUIManager(): DigiaUIManager {
    return DigiaUIManager.getInstance();
}
