import { ScopeContext } from '../state/StateManager';

/**
 * Render payload for widgets
 * Contains context needed for rendering
 */
export interface RenderPayload {
  buildContext?: any;
  scopeContext: ScopeContext;
  widgetHierarchy: string[];
  currentEntityId?: string;

  /**
   * Extend the widget hierarchy with a new level
   */
  withExtendedHierarchy(refName: string): RenderPayload;
}

/**
 * Create a render payload
 */
export function createRenderPayload(options: {
  scopeContext: ScopeContext;
  widgetHierarchy?: string[];
  currentEntityId?: string;
  buildContext?: any;
}): RenderPayload {
  return {
    buildContext: options.buildContext,
    scopeContext: options.scopeContext,
    widgetHierarchy: options.widgetHierarchy || [],
    currentEntityId: options.currentEntityId,
    withExtendedHierarchy(refName: string): RenderPayload {
      return createRenderPayload({
        ...options,
        widgetHierarchy: [...(options.widgetHierarchy || []), refName],
      });
    },
  };
}
