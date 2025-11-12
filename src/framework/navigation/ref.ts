import { createNavigationContainerRef } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';

/**
 * A global navigator reference similar to Flutter's navigatorKey.
 *
 * Set this ref on your app's NavigationContainer:
 * <NavigationContainer ref={navigatorRef as any}>
 * 
 * Note: The 'as any' cast may be needed if your app uses a different version
 * of @react-navigation/core than the SDK. This is safe and doesn't affect runtime behavior.
 */
export const navigatorRef = createNavigationContainerRef();

/**
 * Get the navigator reference if available.
 * Works even without a Stack.Navigator - just needs NavigationContainer to be mounted.
 */
export function getNavigator() {
    // Check if ref is set (NavigationContainer mounted) even without a navigator
    if (navigatorRef.current) {
        return navigatorRef;
    }
    // Fallback to isReady() check for cases with Stack.Navigator
    if (navigatorRef.isReady()) {
        return navigatorRef;
    }
    return null;
}

/**
 * Navigate to a screen.
 * 
 * @param name - Screen name
 * @param params - Parameters to pass
 */
export async function navigate(name: string, params?: any) {
    if (navigatorRef.isReady()) {
        (navigatorRef as any).navigate(name, params);
    }
}

/**
 * Push a new screen onto the navigation stack.
 * Works like Flutter's Navigator.push() - dynamically adds any screen.
 * 
 * @param name - Screen name
 * @param params - Parameters to pass
 */
export async function push(name: string, params?: any) {
    if (navigatorRef.isReady()) {
        navigatorRef.dispatch(StackActions.push(name, params));
    }
}

/**
 * Go back to the previous screen.
 * 
 * @returns True if navigation went back, false otherwise
 */
export function goBack(): boolean {
    if (navigatorRef.isReady() && navigatorRef.canGoBack()) {
        navigatorRef.goBack();
        return true;
    }
    return false;
}

/**
 * Check if the navigator can go back.
 * 
 * @returns True if can go back, false otherwise
 */
export function canGoBack(): boolean {
    if (!navigatorRef.isReady()) {
        return false;
    }
    return navigatorRef.canGoBack();
}

/**
 * Reset the navigation state to a new set of routes.
 * 
 * @param routes - Array of routes
 * @param index - Index of the active route
 */
export function reset(routes: Array<{ name: string; params?: any }>, index?: number) {
    if (navigatorRef.isReady()) {
        navigatorRef.reset({ index: index ?? routes.length - 1, routes });
    }
}

/**
 * Replace the current route with a new one.
 * Works like Flutter's Navigator.pushReplacement()
 * 
 * @param name - Screen name
 * @param params - Parameters to pass
 */
export function replace(name: string, params?: any) {
    if (navigatorRef.isReady()) {
        if ((navigatorRef as any).replace) {
            (navigatorRef as any).replace(name, params);
        } else {
            // Fallback: pop then push
            if (navigatorRef.canGoBack()) {
                navigatorRef.goBack();
            }
            navigatorRef.dispatch(StackActions.push(name, params));
        }
    }
}

/**
 * Pop until a predicate is met.
 * Works like Flutter's Navigator.popUntil()
 * 
 * @param predicate - Function to test each route
 * @returns True if successful, false otherwise
 */
export function popUntil(predicate: (route: any) => boolean): boolean {
    if (!navigatorRef.isReady()) {
        return false;
    }

    const state = navigatorRef.getState();
    const routes = state.routes;

    // Find the target route
    let targetIndex = -1;
    for (let i = routes.length - 1; i >= 0; i--) {
        if (predicate(routes[i])) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex >= 0 && targetIndex < routes.length - 1) {
        // Pop to that route
        const targetRoutes = routes.slice(0, targetIndex + 1);
        navigatorRef.reset({
            index: targetRoutes.length - 1,
            routes: targetRoutes as any,
        });
        return true;
    }

    return false;
}

/**
 * Get the current route name.
 * 
 * @returns The current route name, or null if not available
 */
export function getCurrentRouteName(): string | null {
    if (!navigatorRef.isReady()) {
        return null;
    }
    const state = navigatorRef.getRootState();
    if (!state || !state.routes || state.routes.length === 0) {
        return null;
    }
    return state.routes[state.index]?.name ?? null;
}

/**
 * Get the navigation state.
 * 
 * @returns The navigation state, or null if not available
 */
export function getState() {
    if (!navigatorRef.isReady()) {
        return null;
    }
    return navigatorRef.getState();
}
