import { ExprOr } from '../../models/types';
import { JsonLike } from '../../utils/types';
import { Action, ActionType } from '../base/action';

/**
 * Action for navigating back in the navigation stack.
 * 
 * This action pops the current screen/route and optionally returns
 * a result to the previous screen.
 */
export class NavigateBackAction extends Action {
    /** Whether the navigation is optional (won't throw if navigation fails) */
    readonly maybe: ExprOr<boolean>;

    /** Optional result to pass back to the previous screen */
    readonly result?: ExprOr<any>;

    constructor(options: {
        maybe: ExprOr<boolean>;
        result?: ExprOr<any>;
        disableActionIf?: ExprOr<boolean>;
    }) {
        super({ disableActionIf: options.disableActionIf });
        this.maybe = options.maybe;
        this.result = options.result;
    }

    get actionType(): ActionType {
        return ActionType.NavigateBack;
    }

    toJson(): JsonLike {
        return {
            type: this.actionType,
            maybe: this.maybe.toJson(),
            result: this.result?.toJson(),
        };
    }

    /**
     * Creates a NavigateBackAction from JSON data.
     * 
     * @param json - The JSON object containing action data
     * @returns A new NavigateBackAction instance
     * 
     * @example
     * ```typescript
     * const action = NavigateBackAction.fromJson({
     *   maybe: true,
     *   result: { success: true }
     * });
     * ```
     */
    static fromJson(json: JsonLike): NavigateBackAction {
        return new NavigateBackAction({
            maybe: ExprOr.fromJson<boolean>(json['maybe']) ?? new ExprOr(false),
            result: ExprOr.fromJson<any>(json['result']) ?? undefined,
        });
    }
}
