import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Rebuild state action processor
 * Triggers a re-render of the component by updating state context
 */
export class RebuildStateProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const { rebuildState, stateContextName } = action.data;

    // If stateContextName is provided, rebuild specific named context
    // Otherwise, rebuild the current/origin state
    if (context.triggerRebuild) {
      context.triggerRebuild(stateContextName);
    } else {
      console.warn('triggerRebuild function not provided in context');
    }
  }
}
