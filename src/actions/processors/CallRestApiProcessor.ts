import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';

/**
 * Call REST API action processor - Placeholder
 * TODO: Implement full API call functionality with axios
 */
export class CallRestApiProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<any> {
    // Placeholder - implement API call logic
    console.log('CallRestApi action:', action.data);
    return null;
  }
}
