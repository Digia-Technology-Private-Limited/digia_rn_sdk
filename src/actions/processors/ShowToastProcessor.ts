import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Show toast action processor - Placeholder
 */
export class ShowToastProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    // Placeholder - implement toast display logic
    console.log('ShowToast action:', action.data);
  }
}
