import { Action, ActionFlow } from '../config/types';
import { ScopeContext, expressionEvaluator } from '../expressions/ExpressionEvaluator';
import { ActionProcessor } from './processors/ActionProcessor';
import { NavigateToPageProcessor } from './processors/NavigateToPageProcessor';
import { NavigateBackProcessor } from './processors/NavigateBackProcessor';
import { SetStateProcessor } from './processors/SetStateProcessor';
import { SetAppStateProcessor } from './processors/SetAppStateProcessor';
import { CallRestApiProcessor } from './processors/CallRestApiProcessor';
import { ShowModalProcessor } from './processors/ShowModalProcessor';
import { ShowToastProcessor } from './processors/ShowToastProcessor';
import { OpenUrlProcessor } from './processors/OpenUrlProcessor';
import { RebuildStateProcessor } from './processors/RebuildStateProcessor';

/**
 * Action context provided to processors
 */
export interface ActionContext {
  navigation?: any; // React Navigation object
  pageState?: Record<string, any>;
  setPageState?: (key: string, value: any) => void;
  triggerRebuild?: (stateContextName?: string) => void;
  scopeContext?: ScopeContext;
}

/**
 * Action executor
 * Handles execution of action flows
 * Mirrors Flutter's ActionExecutor
 */
export class ActionExecutor {
  private processors: Map<string, ActionProcessor>;

  constructor() {
    this.processors = new Map();
    this.registerDefaultProcessors();
  }

  /**
   * Register default action processors
   */
  private registerDefaultProcessors(): void {
    this.registerProcessor('Action.navigateToPage', new NavigateToPageProcessor());
    this.registerProcessor('Action.pop', new NavigateBackProcessor());
    this.registerProcessor('Action.setState', new SetStateProcessor());
    this.registerProcessor('Action.setAppState', new SetAppStateProcessor());
    this.registerProcessor('Action.rebuildState', new RebuildStateProcessor());
    this.registerProcessor('Action.callRestApi', new CallRestApiProcessor());
    this.registerProcessor('Action.openDialog', new ShowModalProcessor());
    this.registerProcessor('Action.showToast', new ShowToastProcessor());
    this.registerProcessor('Action.openUrl', new OpenUrlProcessor());
  }

  /**
   * Register a custom action processor
   */
  registerProcessor(actionType: string, processor: ActionProcessor): void {
    this.processors.set(actionType, processor);
  }

  /**
   * Execute an action flow
   */
  async executeActionFlow(
    actionFlow: ActionFlow | null | undefined,
    context: ActionContext
  ): Promise<void> {
    if (!actionFlow || !actionFlow.steps || actionFlow.steps.length === 0) {
      return;
    }

    for (const action of actionFlow.steps) {
      await this.executeAction(action, context);
    }
  }

  /**
   * Execute a single action
   */
  async executeAction(action: Action, context: ActionContext): Promise<any> {
    // Check if action should be disabled
    if (action.disableActionIf) {
      const shouldDisable = await expressionEvaluator.evaluateExprOr<boolean>(
        action.disableActionIf,
        context.scopeContext
      );

      if (shouldDisable) {
        return null;
      }
    }

    const processor = this.processors.get(action.type);

    if (!processor) {
      console.warn(`No processor found for action type: ${action.type}`);
      return null;
    }

    try {
      return await processor.execute(context, action, context.scopeContext);
    } catch (error) {
      console.error(`Action execution failed: ${action.type}`, error);
      throw error;
    }
  }
}

// Singleton instance
export const actionExecutor = new ActionExecutor();
