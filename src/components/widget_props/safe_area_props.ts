import { ExprOr, JsonLike } from "../../framework";

export class SafeAreaProps {
    readonly left?: ExprOr<boolean> | null;
    readonly top?: ExprOr<boolean> | null;
    readonly right?: ExprOr<boolean> | null;
    readonly bottom?: ExprOr<boolean> | null;

    constructor({
        left,
        top,
        right,
        bottom,
    }: {
        left?: ExprOr<boolean> | null;
        top?: ExprOr<boolean> | null;
        right?: ExprOr<boolean> | null;
        bottom?: ExprOr<boolean> | null;
    }) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    static fromJson(json: JsonLike | null): SafeAreaProps {
        return new SafeAreaProps({
            left: ExprOr.fromJson<boolean>(json?.['left']),
            top: ExprOr.fromJson<boolean>(json?.['top']),
            right: ExprOr.fromJson<boolean>(json?.['right']),
            bottom: ExprOr.fromJson<boolean>(json?.['bottom']),
        });
    }
}