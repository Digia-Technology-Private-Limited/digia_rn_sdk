import { Action, ActionId } from './action';
import { ScopeContext } from '../../expr/scope_context';

/**
 * Context for action execution in React Native.
 * 
 * In Flutter, this would be BuildContext. In React Native, we use a more
 * flexible context object that can contain navigation, state, and other
 * runtime information.
 */
export interface ActionContext {
    /** Navigation object for screen transitions */
    navigation?: any;

    /** Current route/screen information */
    route?: any;

    /** Component state setter (if applicable) */
    setState?: (updater: any) => void;

    /** Any additional context data */
    [key: string]: any;
}

/**
 * Abstract base class for action processors.
 * 
 * Each action type has a corresponding processor that knows how to execute it.
 * Processors handle the actual logic of performing actions like navigation,
 * API calls, state updates, etc.
 * 
 * @template T - The specific Action subclass this processor handles
 * 
 * @example
 * ```typescript
 * class NavigateToPageProcessor extends ActionProcessor<NavigateToPageAction> {
 *   async execute(
 *     context: ActionExecutionContext,
 *     action: NavigateToPageAction,
 *     scopeContext?: ScopeContext | null,
 *     options?: { id: string; parentActionId?: ActionId }
 *   ): Promise<any> {
 *     const { navigation } = context;
 *     navigation.navigate(action.pageName);
 *     return null;
 *   }
 * }
 * ```
 */
export abstract class ActionProcessor<T extends Action = Action> {
    /** Execution context set by the factory */
    executionContext?: ActionContext;

    /**
     * Executes the action with the given context.
     * 
     * @param context - The execution context (navigation, state, etc.)
     * @param action - The action to execute
     * @param scopeContext - Optional scope context for expression evaluation
     * @param options - Execution options with required id and optional parentActionId
     * @returns A promise that resolves to the action result (or null)
     */
    abstract execute(
        context: ActionContext,
        action: T,
        scopeContext?: ScopeContext | null,
        options?: {
            /** Required unique identifier for this action execution */
            id: string;
            /** Optional ID of the parent action (if this is a nested action) */
            parentActionId?: ActionId;
        }
    ): Promise<any>;
}
