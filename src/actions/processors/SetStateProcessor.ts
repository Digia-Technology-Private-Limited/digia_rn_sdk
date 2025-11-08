import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext, expressionEvaluator } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Set page state action processor
 */
export class SetStateProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const { setPageState } = context;

    if (!setPageState) {
      throw new Error('setPageState function not provided');
    }

    const updates = action.data.updates || {};

    for (const [key, value] of Object.entries(updates)) {
      const evaluatedValue = await expressionEvaluator.deepEvaluate(
        value,
        scopeContext
      );
      setPageState(key, evaluatedValue);
    }
  }
}
