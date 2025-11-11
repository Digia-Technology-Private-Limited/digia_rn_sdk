import { as$, ExprOr, JsonLike } from "../../framework";


export class NavigationBarItemCustomProps {
    readonly onSelect?: JsonLike | null;
    readonly showIf?: ExprOr<boolean> | null;

    constructor({
        onSelect,
        showIf,
    }: {
        onSelect?: JsonLike | null;
        showIf?: ExprOr<boolean> | null;
    }) {
        this.onSelect = onSelect;
        this.showIf = showIf;
    }

    static fromJson(json: JsonLike | null): NavigationBarItemCustomProps {
        return new NavigationBarItemCustomProps({
            onSelect: as$<JsonLike | null>(json?.['onSelect']),
            showIf: ExprOr.fromJson<boolean>(json?.['showIf']),
        });
    }
}