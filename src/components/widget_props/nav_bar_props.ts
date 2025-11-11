import { as$, ExprOr, JsonLike } from "../../framework";


export class NavigationBarProps {
    readonly backgroundColor?: ExprOr<string> | null;
    readonly animationDuration?: ExprOr<number> | null;
    readonly height?: ExprOr<number> | null;
    readonly elevation?: ExprOr<number> | null;
    readonly surfaceTintColor?: ExprOr<string> | null;
    readonly overlayColor?: ExprOr<string> | null;
    readonly indicatorColor?: ExprOr<string> | null;
    readonly indicatorShape?: ExprOr<string> | null;
    readonly showLabels?: ExprOr<boolean> | null;
    readonly shadow?: any[] | null;
    readonly borderRadius?: string | null;

    constructor({
        backgroundColor,
        animationDuration,
        height,
        elevation,
        borderRadius,
        shadow,
        surfaceTintColor,
        overlayColor,
        indicatorColor,
        indicatorShape,
        showLabels,
    }: {
        backgroundColor?: ExprOr<string> | null;
        animationDuration?: ExprOr<number> | null;
        height?: ExprOr<number> | null;
        elevation?: ExprOr<number> | null;
        borderRadius?: string | null;
        shadow?: any[] | null;
        surfaceTintColor?: ExprOr<string> | null;
        overlayColor?: ExprOr<string> | null;
        indicatorColor?: ExprOr<string> | null;
        indicatorShape?: ExprOr<string> | null;
        showLabels?: ExprOr<boolean> | null;
    }) {
        this.backgroundColor = backgroundColor;
        this.animationDuration = animationDuration;
        this.height = height;
        this.elevation = elevation;
        this.borderRadius = borderRadius;
        this.shadow = shadow;
        this.surfaceTintColor = surfaceTintColor;
        this.overlayColor = overlayColor;
        this.indicatorColor = indicatorColor;
        this.indicatorShape = indicatorShape;
        this.showLabels = showLabels;
    }

    static fromJson(json: JsonLike | null): NavigationBarProps {
        return new NavigationBarProps({
            backgroundColor: ExprOr.fromJson<string>(json?.['backgroundColor']),
            animationDuration: ExprOr.fromJson<number>(json?.['animationDuration']),
            height: ExprOr.fromJson<number>(json?.['height']),
            elevation: ExprOr.fromJson<number>(json?.['elevation']),
            surfaceTintColor: ExprOr.fromJson<string>(json?.['surfaceTintColor']),
            overlayColor: ExprOr.fromJson<string>(json?.['overlayColor']),
            indicatorColor: ExprOr.fromJson<string>(json?.['indicatorColor']),
            indicatorShape: ExprOr.fromJson<string>(json?.['indicatorShape']),
            showLabels: ExprOr.fromJson<boolean>(json?.['showLabels']),
            borderRadius: as$<string | null>(json?.['borderRadius']),
            shadow: as$<any[] | null>(json?.['shadow']),
        });
    }
}