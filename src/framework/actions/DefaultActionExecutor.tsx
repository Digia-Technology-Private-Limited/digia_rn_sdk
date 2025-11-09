import React, { createContext, useContext } from 'react';
import { ActionExecutor } from './action_executor';

/**
 * Context for providing ActionExecutor throughout the widget tree.
 * 
 * This context allows descendant components to access the ActionExecutor
 * instance without prop drilling. Similar to Flutter's InheritedWidget pattern.
 */
const ActionExecutorContext = createContext<ActionExecutor | null>(null);

/**
 * Props for DefaultActionExecutor provider component.
 */
export interface DefaultActionExecutorProps {
    /** The action executor instance that handles all action execution */
    actionExecutor: ActionExecutor;
    /** Child components that can access the action executor */
    children: React.ReactNode;
}

/**
 * Provider component that makes ActionExecutor available to all descendant widgets.
 * 
 * This component wraps the widget tree and provides access to action execution
 * capabilities. It's equivalent to Flutter's InheritedWidget pattern for providing
 * shared functionality down the component tree.
 * 
 * @example
 * ```typescript
 * <DefaultActionExecutor actionExecutor={myActionExecutor}>
 *   <MyApp />
 * </DefaultActionExecutor>
 * ```
 * 
 * Then in descendant components:
 * ```typescript
 * const actionExecutor = useActionExecutor();
 * await actionExecutor.execute(action, payload);
 * ```
 */
export const DefaultActionExecutor: React.FC<DefaultActionExecutorProps> = ({
    actionExecutor,
    children,
}) => {
    return (
        <ActionExecutorContext.Provider value={actionExecutor}>
            {children}
        </ActionExecutorContext.Provider>
    );
};

/**
 * Hook to retrieve the ActionExecutor from the component tree.
 * 
 * This hook should be called from within a component wrapped by DefaultActionExecutor
 * to access action execution capabilities.
 * 
 * @returns The ActionExecutor instance from the nearest DefaultActionExecutor provider
 * @throws Error if no DefaultActionExecutor is found in the ancestor tree
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const actionExecutor = useActionExecutor();
 *   
 *   const handleClick = async () => {
 *     await actionExecutor.execute(myAction, renderPayload);
 *   };
 *   
 *   return <Button onPress={handleClick}>Execute Action</Button>;
 * }
 * ```
 */
export function useActionExecutor(): ActionExecutor {
    const actionExecutor = useContext(ActionExecutorContext);

    if (!actionExecutor) {
        throw new Error(
            'useActionExecutor must be used within a DefaultActionExecutor provider. ' +
            'Make sure your component tree is wrapped with <DefaultActionExecutor>.'
        );
    }

    return actionExecutor;
}

/**
 * Legacy function to retrieve ActionExecutor from context (for compatibility).
 * 
 * @deprecated Use useActionExecutor hook instead
 * @param context - React context (not used, for API compatibility)
 * @returns The ActionExecutor instance
 */
export function getActionExecutor(context?: any): ActionExecutor {
    // In React, we can't access context outside of hooks
    // This function is provided for API compatibility but should use the hook instead
    throw new Error(
        'getActionExecutor is not supported in React. Use useActionExecutor hook instead.'
    );
}
