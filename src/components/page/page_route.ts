/**
 * DUIPageRoute - React Native equivalent of Flutter's MaterialPageRoute for DUI pages.
 * 
 * In React Native, we don't have routes in the same way as Flutter.
 * This module provides utilities for working with React Navigation.
 * 
 * @example
 * ```typescript
 * // Create a route configuration
 * const pageRoute = createDUIPageRoute({
 *   pageId: 'home',
 *   component: HomePageComponent
 * });
 * 
 * // Use with React Navigation
 * navigation.navigate(pageRoute.name, pageRoute.params);
 * ```
 */

/**
 * Options for creating a DUI page route.
 */
export interface DUIPageRouteOptions {
    /** Unique identifier for the page */
    pageId: string;

    /** Optional route parameters */
    params?: Record<string, any>;

    /** Optional custom route name (defaults to /duiPageRoute-{pageId}) */
    name?: string;
}

/**
 * Route configuration for a DUI page.
 */
export interface DUIPageRoute {
    /** The route name used for navigation */
    name: string;

    /** The page ID */
    pageId: string;

    /** Route parameters */
    params?: Record<string, any>;
}

/**
 * Creates a DUI page route configuration.
 * 
 * This generates a route configuration that can be used with React Navigation.
 * The route name follows the pattern: `/duiPageRoute-{pageId}`
 * 
 * @param options - Route configuration options
 * @returns A DUIPageRoute object with name, pageId, and params
 * 
 * @example
 * ```typescript
 * const route = createDUIPageRoute({
 *   pageId: 'userProfile',
 *   params: { userId: '123' }
 * });
 * 
 * // Navigate using React Navigation
 * navigation.navigate(route.name, route.params);
 * ```
 */
export function createDUIPageRoute(options: DUIPageRouteOptions): DUIPageRoute {
    const routeName = options.name ?? `/duiPageRoute-${options.pageId}`;

    return {
        name: routeName,
        pageId: options.pageId,
        params: options.params,
    };
}

/**
 * Extract the page ID from a DUI route name.
 * 
 * @param routeName - The route name (e.g., '/duiPageRoute-home')
 * @returns The extracted page ID, or null if not a DUI route
 * 
 * @example
 * ```typescript
 * const pageId = extractPageIdFromRoute('/duiPageRoute-home');
 * // Returns: 'home'
 * 
 * const invalid = extractPageIdFromRoute('/otherRoute');
 * // Returns: null
 * ```
 */
export function extractPageIdFromRoute(routeName: string): string | null {
    const match = routeName.match(/^\/duiPageRoute-(.+)$/);
    return match ? match[1] : null;
}

/**
 * Check if a route name is a DUI page route.
 * 
 * @param routeName - The route name to check
 * @returns true if the route is a DUI page route, false otherwise
 * 
 * @example
 * ```typescript
 * isDUIPageRoute('/duiPageRoute-home'); // true
 * isDUIPageRoute('/otherRoute'); // false
 * ```
 */
export function isDUIPageRoute(routeName: string): boolean {
    return routeName.startsWith('/duiPageRoute-');
}

/**
 * DUIPageRouteBuilder - Helper class for building DUI page routes.
 * 
 * Provides a fluent API for creating route configurations.
 * 
 * @example
 * ```typescript
 * const route = new DUIPageRouteBuilder('home')
 *   .withParams({ tab: 'profile' })
 *   .withName('/custom-route-name')
 *   .build();
 * ```
 */
export class DUIPageRouteBuilder {
    private pageId: string;
    private params?: Record<string, any>;
    private name?: string;

    constructor(pageId: string) {
        this.pageId = pageId;
    }

    /**
     * Set route parameters.
     */
    withParams(params: Record<string, any>): this {
        this.params = params;
        return this;
    }

    /**
     * Set a custom route name.
     */
    withName(name: string): this {
        this.name = name;
        return this;
    }

    /**
     * Build the route configuration.
     */
    build(): DUIPageRoute {
        return createDUIPageRoute({
            pageId: this.pageId,
            params: this.params,
            name: this.name,
        });
    }
}
