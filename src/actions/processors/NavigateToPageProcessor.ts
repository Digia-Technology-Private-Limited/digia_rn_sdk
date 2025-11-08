import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext, expressionEvaluator } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Navigate to page action processor
 * Handles navigation to different pages/screens
 */
export class NavigateToPageProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const { navigation } = context;

    if (!navigation) {
      throw new Error('Navigation context not provided');
    }

    const pageData = await expressionEvaluator.deepEvaluate(
      action.data.pageData,
      scopeContext
    );

    const pageId = pageData?.id;
    const args = pageData?.args || {};

    if (!pageId) {
      throw new Error('Page ID not provided in navigateToPage action');
    }

    // Handle different navigation modes
    const shouldRemoveStack = action.data.shouldRemovePreviousScreensInStack;

    if (shouldRemoveStack) {
      navigation.reset({
        index: 0,
        routes: [{ name: pageId, params: args }],
      });
    } else {
      navigation.navigate(pageId, args);
    }
  }
}
