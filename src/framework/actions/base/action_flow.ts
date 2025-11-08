import { as$, TypeValidators } from '../../utils/functional_utils';
import { NumUtil } from '../../../framework/utils/num_util';
import { JsonLike } from '../../utils/types';
import { ActionFactory } from '../action_factory';
import { Action } from './action';

/**
 * Represents a flow of actions to be executed sequentially.
 * 
 * An ActionFlow contains a list of actions that are typically triggered
 * by user interactions (e.g., button press, gesture). It can also include
 * analytics data to track user behavior.
 */
export class ActionFlow {
    /** The list of actions to execute */
    readonly actions: Action[];

    /** Whether to show inkwell/ripple effect for touch feedback */
    readonly inkwell: boolean;

    /** Optional analytics data to track with this action flow */
    readonly analyticsData?: JsonLike[];

    constructor(options: {
        actions: Action[];
        inkwell?: boolean;
        analyticsData?: JsonLike[];
    }) {
        this.actions = options.actions;
        this.inkwell = options.inkwell ?? true;
        this.analyticsData = options.analyticsData;
    }

    /**
     * Creates an empty ActionFlow with no actions.
     */
    static empty(): ActionFlow {
        return new ActionFlow({ actions: [] });
    }

    /**
     * Creates an ActionFlow from JSON data.
     * 
     * @param json - The JSON object containing action flow definition
     * @returns The ActionFlow instance, or null if invalid/empty
     * 
     * @example
     * ```typescript
     * const flowJson = {
     *   inkWell: true,
     *   steps: [
     *     { type: 'setState', data: { key: 'count', value: 1 } }
     *   ],
     *   analyticsData: [{ event: 'button_clicked' }]
     * };
     * const flow = ActionFlow.fromJson(flowJson);
     * ```
     */
    static fromJson(json: any): ActionFlow | null {
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            return null;
        }

        const jsonObj = json as JsonLike;

        const inkwell = NumUtil.toBool(jsonObj['inkWell']) ?? true;

        const steps = as$<any[]>(jsonObj['steps'], TypeValidators.array);
        const actions = steps
            ?.filter((e: any) => e != null && typeof e === 'object' && !Array.isArray(e))
            .map((e: any) => ActionFactory.fromJson(e as JsonLike)) ?? [];

        const analyticsDataRaw = as$<any[]>(jsonObj['analyticsData'], TypeValidators.array);
        const analyticsData = analyticsDataRaw
            ?.filter((e: any) => e != null && typeof e === 'object' && !Array.isArray(e))
            .map((e: any) => e as JsonLike) ?? [];

        // It's possible that events need to be sent, regardless of
        // whether actions are present or not.
        if (analyticsData.length === 0 && actions.length === 0) {
            return null;
        }

        return new ActionFlow({
            actions,
            inkwell,
            analyticsData: analyticsData.length > 0 ? analyticsData : undefined,
        });
    }

    /**
     * Converts this ActionFlow to a JSON object.
     */
    toJson(): JsonLike {
        return {
            actions: this.actions.map((e) => e.toJson()),
        };
    }
}
