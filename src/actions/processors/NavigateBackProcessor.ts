import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Navigate back action processor
 */
export class NavigateBackProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const { navigation } = context;

    if (!navigation) {
      throw new Error('Navigation context not provided');
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }
}
