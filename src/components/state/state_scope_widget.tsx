import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StateContext } from './state_context';
import { StateContextProvider, useStateContext } from './state_context_provider';

/**
 * State type enum for different state scopes.
 */
export enum StateType {
    StateContainer = 'stateContainer',
    Page = 'page',
    Component = 'component',
}

/**
 * Props for StatefulScopeWidget component.
 */
interface StatefulScopeWidgetProps {
    /** The namespace for this state scope. */
    namespace?: string;

    /** The ID of this state scope. */
    stateId?: string;

    /** A function that builds the child component using the current state. */
    childBuilder: (stateContext: StateContext) => React.ReactNode;

    /** The initial state values for this scope. */
    initialState: Record<string, any>;

    /** The type of state this widget manages. */
    stateType?: StateType;
}

/**
 * A component that manages a scoped StateContext and re-renders its child when the state changes.
 * It forms part of a hierarchical state management system.
 * 
 * React Native equivalent of Flutter's StatefulScopeWidget.
 * Uses hooks and EventEmitter pattern for state change notifications.
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   return (
 *     <StatefulScopeWidget
 *       namespace="myScope"
 *       initialState={{ count: 0 }}
 *       childBuilder={(stateContext) => {
 *         const count = stateContext.getValue('count');
 *         return (
 *           <View>
 *             <Text>Count: {count}</Text>
 *             <Button
 *               title="Increment"
 *               onPress={() => stateContext.setValue('count', count + 1)}
 *             />
 *           </View>
 *         );
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const StatefulScopeWidget: React.FC<StatefulScopeWidgetProps> = ({
    namespace,
    stateId,
    childBuilder,
    initialState,
    stateType = StateType.StateContainer,
}) => {
    // Get parent state context if available
    const ancestorContext = useStateContext();

    // Force re-render counter for state changes
    const [, setRenderCount] = useState(0);
    const forceUpdate = useCallback(() => {
        setRenderCount((count) => count + 1);
    }, []);

    // Create state context only once
    const stateContextRef = useRef<StateContext | null>(null);

    if (stateContextRef.current === null) {
        stateContextRef.current = new StateContext(namespace, {
            stateId,
            initialState,
            ancestorContext: ancestorContext ?? undefined,
        });
    }

    const stateContext = stateContextRef.current;

    // Subscribe to state changes
    useEffect(() => {
        const handleChange = () => {
            forceUpdate();
        };

        stateContext.on('change', handleChange);

        return () => {
            stateContext.off('change', handleChange);
        };
    }, [stateContext, forceUpdate]);

    // Update initial state if it changes
    // TODO: Optimize by implementing state diffing to only update when necessary
    useEffect(() => {
        // Currently re-initializes on every initialState change
        // Ideally would compare old vs new initialState and only update differences
        const updates: Record<string, any> = {};
        let hasUpdates = false;

        for (const [key, value] of Object.entries(initialState)) {
            if (stateContext.hasKey(key)) {
                updates[key] = value;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            stateContext.setValues(updates, { notify: false });
        }
    }, [initialState, stateContext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Remove all listeners
            stateContext.removeAllListeners();
        };
    }, [stateContext]);

    return (
        <StateContextProvider stateContext={stateContext}>
            {childBuilder(stateContext)}
        </StateContextProvider>
    );
};
