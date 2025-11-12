import React from 'react';
import { Modal, Platform } from 'react-native';
import { getNavigator } from '../navigation/ref';
import { StackActions } from '@react-navigation/native';

/**
 * Options for presenting a dialog.
 */
export interface PresentDialogOptions {
    /** The dialog content component */
    content: React.ReactElement;

    /** Whether tapping outside dismisses the dialog */
    barrierDismissible?: boolean;

    /** Color of the backdrop/barrier */
    barrierColor?: string;

    /** Whether to use safe area insets */
    useSafeArea?: boolean;

    /** Whether to use root navigator */
    useRootNavigator?: boolean;

    /** Navigation reference */
    navigation?: any;

    /** Custom modal props */
    modalProps?: any;
}

/**
 * Options for presenting a bottom sheet.
 */
export interface PresentBottomSheetOptions {
    /** The bottom sheet content component */
    content: React.ReactElement;

    /** Maximum height ratio when scroll is disabled (0-1) */
    scrollControlDisabledMaxHeightRatio?: number;

    /** Background color of the bottom sheet */
    backgroundColor?: string;

    /** Color of the backdrop/barrier */
    barrierColor?: string;

    /** Border configuration */
    border?: {
        color?: string;
        width?: number;
    };

    /** Whether to use safe area insets */
    useSafeArea?: boolean;

    /** Border radius for the bottom sheet */
    borderRadius?: number | { topLeft?: number; topRight?: number };

    /** Optional close icon builder */
    iconBuilder?: React.ReactElement;

    /** Navigation reference */
    navigation?: any;

    /** Callback when dismissed */
    onDismiss?: () => void;
}

/**
 * Options for navigation push.
 */
export interface NavigationPushOptions<T = any> {
    /** Screen name to navigate to */
    screenName: string;

    /** Parameters to pass to the screen */
    params?: T;

    /** Navigation reference */
    navigation?: any;

    /** Predicate to remove routes until this condition is met */
    removeRoutesUntilPredicate?: (route: any) => boolean;
}

/**
 * Present a dialog modal.
 * 
 * React Native equivalent of Flutter's showDialog.
 * Uses React Navigation's modal system or React Native Modal component.
 * 
 * @param options - Dialog presentation options
 * @returns Promise that resolves when dialog is dismissed
 * 
 * @example
 * ```typescript
 * const result = await presentDialog({
 *   content: <MyDialogContent />,
 *   barrierDismissible: true,
 *   navigation
 * });
 * ```
 */
export function presentDialog<T = any>(
    options: PresentDialogOptions
): Promise<T | null> {
    const {
        content,
        barrierDismissible = true,
        barrierColor,
        navigation,
    } = options;

    return new Promise((resolve) => {
        if (navigation) {
            // Use React Navigation modal
            navigation.navigate('DialogModal', {
                content,
                barrierDismissible,
                barrierColor,
                onDismiss: (result?: T) => resolve(result ?? null),
            });
        } else {
            // Fallback: Use React Native Modal
            // This would need to be implemented with a modal manager
            console.warn('presentDialog requires navigation reference');
            resolve(null);
        }
    });
}

/**
 * Present a bottom sheet modal.
 * 
 * React Native equivalent of Flutter's showModalBottomSheet.
 * 
 * @param options - Bottom sheet presentation options
 * @returns Promise that resolves when bottom sheet is dismissed
 * 
 * @example
 * ```typescript
 * const result = await presentBottomSheet({
 *   content: <MyBottomSheetContent />,
 *   backgroundColor: '#FFFFFF',
 *   borderRadius: 16,
 *   navigation
 * });
 * ```
 */
export function presentBottomSheet<T = any>(
    options: PresentBottomSheetOptions
): Promise<T | null> {
    const {
        content,
        scrollControlDisabledMaxHeightRatio = 1,
        backgroundColor,
        barrierColor,
        border,
        useSafeArea = true,
        borderRadius,
        iconBuilder,
        navigation,
        onDismiss,
    } = options;

    return new Promise((resolve) => {
        if (navigation) {
            // Use React Navigation modal or bottom sheet library
            navigation.navigate('BottomSheetModal', {
                content,
                scrollControlDisabledMaxHeightRatio,
                backgroundColor,
                barrierColor,
                border,
                useSafeArea,
                borderRadius,
                iconBuilder,
                onDismiss: (result?: T) => {
                    onDismiss?.();
                    resolve(result ?? null);
                },
            });
        } else {
            // Fallback
            console.warn('presentBottomSheet requires navigation reference');
            resolve(null);
        }
    });
}

/**
 * NavigatorHelper - Utility class for navigation operations.
 * 
 * React Native equivalent of Flutter's Navigator helper methods.
 * Provides push, pop, and other navigation utilities.
 */
export class NavigatorHelper {
    /**
     * Push a new screen onto the navigation stack.
     * Works like Flutter's Navigator.push() - no need to pre-define screens.
     * 
     * @param options - Navigation options
     * @returns Promise that resolves when navigation completes
     * 
     * @example
     * ```typescript
     * await NavigatorHelper.push({
     *   screenName: 'Profile',
     *   params: { userId: '123' },
     * });
     * ```
     */
    static async push<T = any>(
        options: NavigationPushOptions<T>
    ): Promise<void> {
        const {
            screenName,
            params,
            navigation,
            removeRoutesUntilPredicate,
        } = options;

        // Use provided navigation or fall back to global navigatorRef
        let nav = navigation ?? getNavigator();

        if (!nav) {
            console.error(
                'NavigatorHelper.push: navigation reference not available. ' +
                'Make sure NavigationContainer is mounted with ref={navigatorRef}.'
            );
            throw new Error('Navigation reference not available');
        }

        // Flutter-like navigation: Always push to "Page" screen with pageId
        // This allows dynamic page rendering without registering all routes
        if (removeRoutesUntilPredicate) {
            // Remove routes until predicate is met, then push
            const state = nav.getState();
            const routes = state.routes;

            // Find the index where we should reset to
            let resetIndex = -1;
            for (let i = routes.length - 1; i >= 0; i--) {
                if (removeRoutesUntilPredicate(routes[i])) {
                    resetIndex = i;
                    break;
                }
            }

            if (resetIndex >= 0) {
                // Reset to that route, then push new screen
                const resetRoutes = routes.slice(0, resetIndex + 1);
                nav.reset({
                    index: resetRoutes.length,
                    routes: [
                        ...resetRoutes,
                        { name: 'Page', params: { pageId: screenName, params } },
                    ],
                });
            } else {
                // Just push if predicate never matched
                nav.dispatch(StackActions.push('Page', { pageId: screenName, params }));
            }
        } else {
            // Simple push - navigate to Page with pageId
            nav.dispatch(StackActions.push('Page', { pageId: screenName, params }));
        }
    }

    /**
     * Pop the current screen from the navigation stack.
     * 
     * @param navigation - Navigation reference (optional, uses global ref if not provided)
     * @returns True if navigation can go back, false otherwise
     * 
     * @example
     * ```typescript
     * const didPop = NavigatorHelper.pop(navigation);
     * ```
     */
    static pop(navigation?: any): boolean {
        const nav = navigation ?? getNavigator();

        if (!nav) {
            console.warn(
                'NavigatorHelper.pop: navigation reference not available.'
            );
            return false;
        }

        if (nav.canGoBack()) {
            nav.goBack();
            return true;
        }

        return false;
    }

    /**
     * Pop until a predicate is met.
     * Works like Flutter's Navigator.popUntil()
     * 
     * @param navigation - Navigation reference (optional, uses global ref if not provided)
     * @param predicate - Function to test each route
     * @returns True if successful, false otherwise
     * 
     * @example
     * ```typescript
     * NavigatorHelper.popUntil(
     *   navigation,
     *   (route) => route.name === 'Home'
     * );
     * ```
     */
    static popUntil(
        navigation: any,
        predicate: (route: any) => boolean
    ): boolean {
        const nav = navigation ?? getNavigator();

        if (!nav) {
            console.warn('NavigatorHelper.popUntil: navigation reference not available');
            return false;
        }

        const state = nav.getState();
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
            nav.reset({
                index: targetRoutes.length - 1,
                routes: targetRoutes,
            });
            return true;
        }

        return false;
    }

    /**
     * Replace the current route with a new one.
     * Works like Flutter's Navigator.pushReplacement()
     * 
     * @param navigation - Navigation reference (optional, uses global ref if not provided)
     * @param screenName - Screen name to navigate to
     * @param params - Parameters to pass
     * 
     * @example
     * ```typescript
     * NavigatorHelper.replace(navigation, 'Login', { redirectTo: 'Home' });
     * ```
     */
    static replace(
        navigation: any,
        screenName: string,
        params?: any
    ): void {
        const nav = navigation ?? getNavigator();

        if (!nav) {
            console.warn('NavigatorHelper.replace: navigation reference not available');
            return;
        }

        // Navigate to Page screen with replace
        if ((nav as any).replace) {
            (nav as any).replace('Page', { pageId: screenName, params });
        } else {
            // Fallback: pop then push
            if (nav.canGoBack()) {
                nav.goBack();
            }
            nav.navigate('Page' as never, { pageId: screenName, params } as never);
        }
    }

    /**
     * Check if the navigator can go back.
     * 
     * @param navigation - Navigation reference (optional, uses global ref if not provided)
     * @returns True if can go back, false otherwise
     */
    static canGoBack(navigation?: any): boolean {
        const nav = navigation ?? getNavigator();

        if (!nav) {
            return false;
        }

        return nav.canGoBack?.() ?? false;
    }

    /**
     * Get the current route name.
     * 
     * @param navigation - Navigation reference (optional, uses global ref if not provided)
     * @returns The current route name, or null if not available
     */
    static getCurrentRoute(navigation?: any): string | null {
        const nav = navigation ?? getNavigator();

        if (!nav) {
            return null;
        }

        const state = nav.getState();
        if (!state || !state.routes || state.routes.length === 0) {
            return null;
        }

        const currentRoute = state.routes[state.index];
        return currentRoute?.name ?? null;
    }
}
