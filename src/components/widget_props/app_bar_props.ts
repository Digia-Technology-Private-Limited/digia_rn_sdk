
import { as$, ExprOr, JsonLike, tryKeys } from '../../framework';
import { ActionFlow } from '../../framework/actions/base/action_flow';
import { TextPropsClass, TextProps } from './text_props';

export class AppBarProps {
    readonly title: TextProps;
    readonly elevation?: ExprOr<number> | null;
    readonly shadowColor?: ExprOr<string> | null;
    readonly backgroundColor?: ExprOr<string> | null;
    readonly iconColor?: ExprOr<string> | null;
    readonly leadingIcon?: JsonLike | null;
    readonly automaticallyImplyLeading?: ExprOr<boolean> | null;
    readonly defaultButtonColor?: ExprOr<string> | null;
    readonly onTapLeadingIcon?: ActionFlow | null;
    readonly trailingIcon?: JsonLike | null;
    readonly centerTitle?: ExprOr<boolean> | null;
    readonly titleSpacing?: ExprOr<number> | null;
    readonly enableCollapsibleAppBar?: ExprOr<boolean> | null;
    readonly expandedHeight?: ExprOr<string> | null;
    readonly collapsedHeight?: ExprOr<string> | null;
    readonly pinned?: ExprOr<boolean> | null;
    readonly floating?: ExprOr<boolean> | null;
    readonly snap?: ExprOr<boolean> | null;
    readonly height?: ExprOr<string> | null;
    readonly toolbarHeight?: ExprOr<string> | null;
    readonly bottomSectionHeight?: ExprOr<string> | null;
    readonly bottomSectionWidth?: ExprOr<string> | null;
    readonly useFlexibleSpace?: ExprOr<boolean> | null;
    readonly titlePadding?: ExprOr<string> | null;
    readonly collapseMode?: ExprOr<string> | null;
    readonly expandedTitleScale?: ExprOr<number> | null;
    readonly visibility?: ExprOr<boolean> | null;
    readonly shape?: JsonLike | null;

    constructor({
        title,
        elevation,
        shadowColor,
        backgroundColor,
        iconColor,
        leadingIcon,
        automaticallyImplyLeading,
        defaultButtonColor,
        onTapLeadingIcon,
        trailingIcon,
        centerTitle,
        titleSpacing,
        enableCollapsibleAppBar,
        expandedHeight,
        collapsedHeight,
        pinned,
        floating,
        snap,
        toolbarHeight,
        useFlexibleSpace,
        titlePadding,
        collapseMode,
        expandedTitleScale,
        shape,
        bottomSectionHeight,
        bottomSectionWidth,
        height,
        visibility,
    }: {
        title: TextProps;
        elevation?: ExprOr<number> | null;
        shadowColor?: ExprOr<string> | null;
        backgroundColor?: ExprOr<string> | null;
        iconColor?: ExprOr<string> | null;
        leadingIcon?: JsonLike | null;
        automaticallyImplyLeading?: ExprOr<boolean> | null;
        defaultButtonColor?: ExprOr<string> | null;
        onTapLeadingIcon?: ActionFlow | null;
        trailingIcon?: JsonLike | null;
        centerTitle?: ExprOr<boolean> | null;
        titleSpacing?: ExprOr<number> | null;
        enableCollapsibleAppBar?: ExprOr<boolean> | null;
        expandedHeight?: ExprOr<string> | null;
        collapsedHeight?: ExprOr<string> | null;
        pinned?: ExprOr<boolean> | null;
        floating?: ExprOr<boolean> | null;
        snap?: ExprOr<boolean> | null;
        toolbarHeight?: ExprOr<string> | null;
        useFlexibleSpace?: ExprOr<boolean> | null;
        titlePadding?: ExprOr<string> | null;
        collapseMode?: ExprOr<string> | null;
        expandedTitleScale?: ExprOr<number> | null;
        shape?: JsonLike | null;
        bottomSectionHeight?: ExprOr<string> | null;
        bottomSectionWidth?: ExprOr<string> | null;
        height?: ExprOr<string> | null;
        visibility?: ExprOr<boolean> | null;
    }) {
        this.title = title;
        this.elevation = elevation;
        this.shadowColor = shadowColor;
        this.backgroundColor = backgroundColor;
        this.iconColor = iconColor;
        this.leadingIcon = leadingIcon;
        this.automaticallyImplyLeading = automaticallyImplyLeading;
        this.defaultButtonColor = defaultButtonColor;
        this.onTapLeadingIcon = onTapLeadingIcon;
        this.trailingIcon = trailingIcon;
        this.centerTitle = centerTitle;
        this.titleSpacing = titleSpacing;
        this.enableCollapsibleAppBar = enableCollapsibleAppBar;
        this.expandedHeight = expandedHeight;
        this.collapsedHeight = collapsedHeight;
        this.pinned = pinned;
        this.floating = floating;
        this.snap = snap;
        this.toolbarHeight = toolbarHeight;
        this.useFlexibleSpace = useFlexibleSpace;
        this.titlePadding = titlePadding;
        this.collapseMode = collapseMode;
        this.expandedTitleScale = expandedTitleScale;
        this.shape = shape;
        this.bottomSectionHeight = bottomSectionHeight;
        this.bottomSectionWidth = bottomSectionWidth;
        this.height = height;
        this.visibility = visibility;
    }

    static fromJson(json: JsonLike | null): AppBarProps {
        return new AppBarProps({
            title: as$<JsonLike | null>(json?.['title'])?.let(TextPropsClass.fromJson) ?? new TextPropsClass({}),
            elevation: ExprOr.fromJson<number>(json?.['elevation']),
            shadowColor: ExprOr.fromJson<string>(json?.['shadowColor']),
            backgroundColor: tryKeys<ExprOr<string> | null>(
                json ?? {},
                ['backgrounColor', 'backgroundColor'],
                {
                    parse: (p0: any) => ExprOr.fromJson<string>(p0)
                }
            ),
            iconColor: ExprOr.fromJson<string>(json?.['iconColor']),
            leadingIcon: as$<JsonLike | null>(json?.['leadingIcon']),
            onTapLeadingIcon: ActionFlow.fromJson(json?.['onTapLeadingIcon']),
            trailingIcon: as$<JsonLike | null>(json?.['trailingIcon']),
            centerTitle: ExprOr.fromJson<boolean>(json?.['centerTitle']),
            titleSpacing: ExprOr.fromJson<number>(json?.['titleSpacing']),
            enableCollapsibleAppBar: ExprOr.fromJson<boolean>(json?.['enableCollapsibleAppBar']),
            expandedHeight: ExprOr.fromJson<string>(json?.['expandedHeight']),
            collapsedHeight: ExprOr.fromJson<string>(json?.['collapsedHeight']),
            pinned: ExprOr.fromJson<boolean>(json?.['pinned']),
            floating: ExprOr.fromJson<boolean>(json?.['floating']),
            snap: ExprOr.fromJson<boolean>(json?.['snap']),
            toolbarHeight: ExprOr.fromJson<string>(json?.['toolbarHeight']),
            useFlexibleSpace: ExprOr.fromJson<boolean>(json?.['useFlexibleSpace']),
            titlePadding: ExprOr.fromJson<string>(json?.['titlePadding']),
            collapseMode: ExprOr.fromJson<string>(json?.['collapseMode']),
            expandedTitleScale: ExprOr.fromJson<number>(json?.['expandedTitleScale']),
            shape: as$<JsonLike | null>(json?.['shape']),
            bottomSectionHeight: ExprOr.fromJson<string>(json?.['bottomSectionHeight']),
            bottomSectionWidth: ExprOr.fromJson<string>(json?.['bottomSectionWidth']),
            automaticallyImplyLeading: ExprOr.fromJson<boolean>(json?.['automaticallyImplyLeading']),
            defaultButtonColor: ExprOr.fromJson<string>(json?.['defaultButtonColor']),
            height: ExprOr.fromJson<string>(json?.['height']),
            visibility: ExprOr.fromJson<boolean>(json?.['visibility']),
        });
    }
}