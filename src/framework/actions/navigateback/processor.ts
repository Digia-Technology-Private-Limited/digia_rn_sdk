import { ScopeContext } from '../../expr/scope_context';
import { ActionProcessor, ActionExecutionContext } from '../base/processor';
import { NavigateBackAction } from './action';
import { ActionId } from '../base/action';

/**
 * Processor for NavigateBackAction.
 * 
 * Handles navigation back in the navigation stack, with optional
 * result passing to the previous screen.
 */
export class NavigateBackProcessor extends ActionProcessor<NavigateBackAction> {
    async execute(
        context: ActionExecutionContext,
        action: NavigateBackAction,
        scopeContext?: ScopeContext | null,
        options?: {
            id: string;
            parentActionId?: ActionId;
        }
    ): Promise<any> {
        const maybe = action.maybe?.evaluate(scopeContext) ?? false;
        const result = {
            data: action.result?.deepEvaluate(scopeContext),
        };

        let navigationResult: any;

        try {
            const { navigation } = context;

            if (!navigation) {
                throw new Error('Navigation object not found in execution context');
            }

            if (maybe) {
                // Check if can go back before attempting
                if (navigation.canGoBack && navigation.canGoBack()) {
                    navigation.goBack();
                    navigationResult = true;
                } else {
                    navigationResult = false;
                }
            } else {
                // Force navigation back
                navigation.goBack();
                navigationResult = null;
            }

            return navigationResult;
        } catch (e) {
            throw e;
        }
    }
}
