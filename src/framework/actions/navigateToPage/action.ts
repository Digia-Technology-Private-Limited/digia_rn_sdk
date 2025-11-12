import { ExprOr } from '../../models/types';
import { JsonLike } from '../../utils/types';
import { Action, ActionType } from '../base/action';
import { ActionFlow } from '../base/action_flow';

export class NavigateToPageAction extends Action {
    readonly pageData?: ExprOr<JsonLike>;
    readonly waitForResult: boolean;
    readonly shouldRemovePreviousScreensInStack: boolean;
    readonly routeNametoRemoveUntil?: ExprOr<string>;
    readonly onResult?: ActionFlow | null;

    constructor(options: {
        pageData?: ExprOr<JsonLike> | null;
        waitForResult?: boolean;
        shouldRemovePreviousScreensInStack?: boolean;
        routeNametoRemoveUntil?: ExprOr<string> | null;
        onResult?: ActionFlow | null;
        disableActionIf?: ExprOr<boolean>;
    }) {
        super({ disableActionIf: options.disableActionIf });
        this.pageData = options.pageData ?? undefined;
        this.waitForResult = options.waitForResult ?? false;
        this.shouldRemovePreviousScreensInStack = options.shouldRemovePreviousScreensInStack ?? false;
        this.routeNametoRemoveUntil = options.routeNametoRemoveUntil ?? undefined;
        this.onResult = options.onResult ?? undefined;
    }

    get actionType(): ActionType {
        return ActionType.NavigateToPage;
    }

    toJson(): JsonLike {
        return {
            type: this.actionType,
            pageData: this.pageData?.toJson(),
            waitForResult: this.waitForResult,
            shouldRemovePreviousScreensInStack: this.shouldRemovePreviousScreensInStack,
            routeNametoRemoveUntil: this.routeNametoRemoveUntil?.toJson(),
            onResult: this.onResult?.toJson(),
        };
    }

    static fromJson(json: JsonLike): NavigateToPageAction {
        const pageData = ExprOr.fromJson<JsonLike>(json['pageData'] as any) ?? undefined;
        const waitForResult = (json['waitForResult'] as any) ?? false;
        const shouldRemovePreviousScreensInStack = (json['shouldRemovePreviousScreensInStack'] as any) ?? false;
        const routeNametoRemoveUntil = ExprOr.fromJson<string>(json['routeNametoRemoveUntil'] as any) ?? undefined;
        const onResult = (json['onResult'] != null) ? ActionFlow.fromJson(json['onResult']) : undefined;

        return new NavigateToPageAction({
            pageData: pageData as ExprOr<JsonLike> | undefined,
            waitForResult: !!waitForResult,
            shouldRemovePreviousScreensInStack: !!shouldRemovePreviousScreensInStack,
            routeNametoRemoveUntil: routeNametoRemoveUntil as ExprOr<string> | undefined,
            onResult: onResult ?? undefined,
        });
    }
}
