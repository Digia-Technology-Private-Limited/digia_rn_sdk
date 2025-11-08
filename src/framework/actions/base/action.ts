import { ExprOr } from '../../models/types';

/**
 * Action types supported by the Digia UI SDK.
 * 
 * Maps action names to their string identifiers used in JSON configurations.
 */
export enum ActionType {
    CallRestApi = 'Action.callRestApi',
    ControlDrawer = 'Action.controlDrawer',
    ControlNavBar = 'Action.controlNavBar',
    ControlObject = 'Action.controlObject',
    CopyToClipboard = 'Action.copyToClipBoard',
    Delay = 'Action.delay',
    ImagePicker = 'Action.imagePicker',
    NavigateBack = 'Action.pop',
    NavigateBackUntil = 'Action.popUntil',
    NavigateToPage = 'Action.navigateToPage',
    OpenUrl = 'Action.openUrl',
    PostMessage = 'Action.handleDigiaMessage',
    RebuildState = 'Action.rebuildState',
    SetState = 'Action.setState',
    ExecuteCallback = 'Action.executeCallback',
    ShareContent = 'Action.share',
    ShowBottomSheet = 'Action.showBottomSheet',
    ShowDialog = 'Action.openDialog',
    ShowToast = 'Action.showToast',
    UploadFile = 'Action.upload',
    FilePicker = 'Action.filePicker',
    FireEvent = 'Action.fireEvent',
    SetAppState = 'Action.setAppState',
}

/**
 * Convert a string value to an ActionType.
 * 
 * @param value - The string value to convert
 * @returns The corresponding ActionType or undefined if not found
 */
export function actionTypeFromString(value: string): ActionType | undefined {
    return Object.values(ActionType).find(type => type === value) as ActionType | undefined;
}

/**
 * Unique identifier for an action.
 */
export type ActionId = string;

/**
 * Mixin interface for action-related properties.
 */
export interface ActionMixin {
    /** The type of action */
    readonly actionType: ActionType;

    /** Optional unique identifier for this action */
    actionId?: ActionId;
}

/**
 * Base class for all actions in the Digia UI SDK.
 * 
 * Actions represent operations that can be triggered by user interactions
 * or other events in the application.
 * 
 * @example
 * ```typescript
 * class NavigateAction extends Action {
 *   constructor(public pageName: string) {
 *     super({ actionType: ActionType.NavigateToPage });
 *   }
 *   
 *   toJson() {
 *     return { type: this.actionType, pageName: this.pageName };
 *   }
 * }
 * ```
 */
export abstract class Action implements ActionMixin {
    /** The type of action */
    public abstract readonly actionType: ActionType;

    /** Optional unique identifier for this action */
    private _actionId?: ActionId;

    /** Optional expression to conditionally disable this action */
    public disableActionIf?: ExprOr<boolean>;

    constructor(options?: {
        disableActionIf?: ExprOr<boolean>;
        actionId?: ActionId;
    }) {
        this.disableActionIf = options?.disableActionIf;
        this._actionId = options?.actionId;
    }

    /**
     * Gets the action ID.
     */
    get actionId(): ActionId | undefined {
        return this._actionId;
    }

    /**
     * Sets the action ID.
     */
    set actionId(id: ActionId | undefined) {
        this._actionId = id;
    }

    /**
     * Converts the action to a JSON representation.
     * 
     * Subclasses must implement this method to provide their specific
     * serialization logic.
     * 
     * @returns The JSON representation of this action
     */
    abstract toJson(): Record<string, any>;
}
