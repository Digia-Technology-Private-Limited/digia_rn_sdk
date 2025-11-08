import { ExprOr } from '../models/types';
import { as$ } from '../utils/functional_utils';
import { JsonLike } from '../utils/types';
import { Action, ActionType, actionTypeFromString } from './base/action';
import { NavigateBackAction } from './navigateback/action';

/**
 * Factory class for creating Action instances from JSON data.
 * 
 * Deserializes action definitions from server responses and creates
 * the appropriate Action subclass based on the action type.
 */
export class ActionFactory {
    /**
     * Creates an Action instance from JSON data.
     * 
     * @param json - The JSON object containing action definition
     * @returns The appropriate Action subclass instance
     * @throws Error if action type is unknown or required data is missing
     * 
     * @example
     * ```typescript
     * const actionJson = {
     *   type: 'setState',
     *   disableActionIf: false,
     *   data: {
     *     key: 'counter',
     *     value: 42
     *   }
     * };
     * const action = ActionFactory.fromJson(actionJson);
     * ```
     */
    static fromJson(json: JsonLike): Action {
        const actionType = actionTypeFromString(json['type'] as string);
        if (!actionType) {
            throw new Error(`Unknown action type: ${json['type']}`);
        }

        const disableActionIf = ExprOr.fromJson<boolean>(json['disableActionIf']);
        const actionData = as$<JsonLike>(json['data']) ?? {};

        let action: Action;

        switch (actionType) {
            // case ActionType.SetState:
            //     action = SetStateAction.fromJson(actionData);
            //     break;

            // case ActionType.NavigateToPage:
            //     action = NavigateToPageAction.fromJson(actionData);
            //     break;

            case ActionType.NavigateBack:
                action = NavigateBackAction.fromJson(actionData);
                break;

            default:
                throw new Error(`Action type ${actionType} not yet implemented`);
        }

        if (disableActionIf !== null) {
            action.disableActionIf = disableActionIf;
        }
        return action;
    }
}
