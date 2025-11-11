import { as$, ExprOr, JsonLike } from '../../framework';
import { TextProps, TextPropsClass } from './text_props';

export class NavigationBarItemDefaultProps {
    readonly unselectedType?: string | null;
    readonly unselectedIcon?: JsonLike | null;
    readonly unselectedImage?: JsonLike | null;
    readonly selectedType?: string | null;
    readonly selectedIcon?: JsonLike | null;
    readonly selectedImage?: JsonLike | null;
    readonly labelText?: TextProps | null;
    readonly onSelect?: JsonLike | null;
    readonly showIf?: ExprOr<boolean> | null;

    constructor({
        unselectedType,
        unselectedIcon,
        unselectedImage,
        selectedType,
        selectedIcon,
        selectedImage,
        labelText,
        onSelect,
        showIf,
    }: {
        unselectedType?: string | null;
        unselectedIcon?: JsonLike | null;
        unselectedImage?: JsonLike | null;
        selectedType?: string | null;
        selectedIcon?: JsonLike | null;
        selectedImage?: JsonLike | null;
        labelText?: TextProps | null;
        onSelect?: JsonLike | null;
        showIf?: ExprOr<boolean> | null;
    }) {
        this.unselectedType = unselectedType;
        this.unselectedIcon = unselectedIcon;
        this.unselectedImage = unselectedImage;
        this.selectedType = selectedType;
        this.selectedIcon = selectedIcon;
        this.selectedImage = selectedImage;
        this.labelText = labelText;
        this.onSelect = onSelect;
        this.showIf = showIf;
    }

    static fromJson(json: JsonLike | null): NavigationBarItemDefaultProps {
        return new NavigationBarItemDefaultProps({
            unselectedType: as$<string | null>(json?.['unselectedType']),
            unselectedIcon: as$<JsonLike | null>(json?.['unselectedIcon']),
            unselectedImage: as$<JsonLike | null>(json?.['unselectedImage']),
            selectedType: as$<string | null>(json?.['selectedType']),
            selectedIcon: as$<JsonLike | null>(json?.['selectedIcon']),
            selectedImage: as$<JsonLike | null>(json?.['selectedImage']),
            labelText: TextPropsClass.fromJson(as$<JsonLike | null>(json?.['labelText']) ?? {}),
            onSelect: as$<JsonLike | null>(json?.['onSelect']),
            showIf: ExprOr.fromJson<boolean>(json?.['showIf']),
        });
    }
}