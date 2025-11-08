import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';
import { useGlobalState } from '../../state/GlobalState';
import { expressionEvaluator } from '../../expressions/ExpressionEvaluator';

/**
 * Set global app state action processor
 */
export class SetAppStateProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const { setState } = useGlobalState.getState();
    const updates = action.data.updates || {};

    for (const [key, value] of Object.entries(updates)) {
      const evaluatedValue = await expressionEvaluator.deepEvaluate(
        value,
        scopeContext
      );
      setState(key, evaluatedValue);
    }
  }
}
