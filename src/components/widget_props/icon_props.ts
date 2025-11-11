import { as$, ExprOr, JsonLike } from "../../framework";

export class IconProps {
    readonly iconData: JsonLike;
    readonly size?: ExprOr<number> | null;
    readonly color?: ExprOr<string> | null;

    static empty(): IconProps {
        return new IconProps({ iconData: {} });
    }

    constructor({
        iconData,
        size,
        color,
    }: {
        iconData: JsonLike;
        size?: ExprOr<number> | null;
        color?: ExprOr<string> | null;
    }) {
        this.iconData = iconData;
        this.size = size;
        this.color = color;
    }

    static fromJson(json: JsonLike | null): IconProps | null {
        if (json == null) return null;

        const iconData = as$<JsonLike>(json['iconData']);
        if (iconData == null) return null;

        return new IconProps({
            iconData: iconData,
            size: ExprOr.fromJson<number>(json['iconSize']),
            color: ExprOr.fromJson<string>(json['iconColor']),
        });
    }

    copyWith({
        iconData,
        size,
        color,
    }: {
        iconData?: JsonLike;
        size?: ExprOr<number>;
        color?: ExprOr<string>;
    }): IconProps {
        return new IconProps({
            iconData: iconData ?? this.iconData,
            size: size ?? this.size,
            color: color ?? this.color,
        });
    }
}