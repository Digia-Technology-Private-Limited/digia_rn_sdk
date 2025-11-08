import { JSFunctions } from './js_functions';

/**
 * Stub implementation that throws an error.
 * Used as a fallback when no platform-specific implementation is available.
 * 
 * @throws Error indicating JSFunctions is not supported
 */
export function getJSFunction(): JSFunctions {
    throw new Error('Cannot create a JSFunctions - platform not supported');
}
