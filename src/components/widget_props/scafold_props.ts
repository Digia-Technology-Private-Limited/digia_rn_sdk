import { ExprOr } from "../../framework/models/types";
import { as$, JsonLike } from "../../framework/utils";

export class ScaffoldProps {
    readonly scaffoldBackgroundColor?: ExprOr<string> | null;
    readonly enableSafeArea?: ExprOr<boolean> | null;
    readonly resizeToAvoidBottomInset?: ExprOr<boolean> | null;
    readonly body?: JsonLike | null;
    readonly appBar?: JsonLike | null;
    readonly drawer?: JsonLike | null;
    readonly endDrawer?: JsonLike | null;
    readonly bottomNavigationBar?: JsonLike | null;
    readonly persistentFooterButtons?: JsonLike[] | null;

    constructor({
        scaffoldBackgroundColor,
        enableSafeArea,
        body,
        appBar,
        drawer,
        endDrawer,
        bottomNavigationBar,
        persistentFooterButtons,
        resizeToAvoidBottomInset
    }: {
        scaffoldBackgroundColor?: ExprOr<string> | null;
        enableSafeArea?: ExprOr<boolean> | null;
        body?: JsonLike | null;
        appBar?: JsonLike | null;
        drawer?: JsonLike | null;
        endDrawer?: JsonLike | null;
        bottomNavigationBar?: JsonLike | null;
        persistentFooterButtons?: JsonLike[] | null;
        resizeToAvoidBottomInset?: ExprOr<boolean> | null;
    }) {
        this.scaffoldBackgroundColor = scaffoldBackgroundColor;
        this.enableSafeArea = enableSafeArea;
        this.body = body;
        this.appBar = appBar;
        this.drawer = drawer;
        this.endDrawer = endDrawer;
        this.bottomNavigationBar = bottomNavigationBar;
        this.persistentFooterButtons = persistentFooterButtons;
        this.resizeToAvoidBottomInset = resizeToAvoidBottomInset;
    }

    static fromJson(json: JsonLike): ScaffoldProps {
        return new ScaffoldProps({
            scaffoldBackgroundColor: ExprOr.fromJson<string>(json['scaffoldBackgroundColor']),
            enableSafeArea: ExprOr.fromJson<boolean>(json['enableSafeArea']),
            body: as$<JsonLike>(json['body']),
            appBar: as$<JsonLike>(json['appBar']),
            drawer: as$<JsonLike>(json['drawer']),
            endDrawer: as$<JsonLike>(json['endDrawer']),
            bottomNavigationBar: as$<JsonLike>(json['bottomNavigationBar']),
            persistentFooterButtons: as$<JsonLike[]>(json['persistentFooterButtons']),
            resizeToAvoidBottomInset: ExprOr.fromJson<boolean>(json['resizeToAvoidBottomInset'])
        });
    }
}
