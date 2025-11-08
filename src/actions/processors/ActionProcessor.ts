import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';

/**
 * Base action processor interface
 * All action processors must implement this
 */
export abstract class ActionProcessor {
  abstract execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<any>;
}
