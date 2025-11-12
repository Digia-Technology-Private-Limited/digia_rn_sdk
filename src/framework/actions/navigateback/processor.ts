import { ScopeContext } from '../../expr/scope_context';
import { ActionProcessor, ActionContext } from '../base/processor';
import { NavigateBackAction } from './action';
import { ActionId } from '../base/action';
import { NavigatorHelper } from '../../utils/navigation_util';
import { useNavigationContainerRef } from '@react-navigation/native';

/**
 * Processor for NavigateBackAction.
 * 
 * Handles navigation back in the navigation stack, with optional
 * result passing to the previous screen.
 */
export class NavigateBackProcessor extends ActionProcessor<NavigateBackAction> {
    async execute(
        context: ActionContext,
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
            const navigation = (context as any)?.navigation;

            if (maybe) {
                // Check if can go back before attempting
                const canGoBack = NavigatorHelper.canGoBack(navigation);
                if (canGoBack) {
                    NavigatorHelper.pop(navigation);
                    navigationResult = true;
                } else {
                    navigationResult = false;
                }
            } else {
                // Force navigation back
                NavigatorHelper.pop(navigation);
                navigationResult = null;
            }

            return navigationResult;
        } catch (e) {
            throw e;
        }
    }
}
