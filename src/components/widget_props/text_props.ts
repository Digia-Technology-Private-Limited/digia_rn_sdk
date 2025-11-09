import { TextStyle, TextProps as RNTextProps } from 'react-native';
import { ExprOr } from '../../framework/models/types';
import { as$, JsonLike } from '../../framework/utils';


export interface TextProps {
    text?: ExprOr<string>;
    textStyle?: JsonLike;
    maxLines?: ExprOr<number>;
    alignment?: ExprOr<string>;
    overflow?: ExprOr<string>;
}

export class TextPropsClass implements TextProps {
    readonly text?: ExprOr<string>;
    readonly textStyle?: JsonLike | TextStyle;
    readonly maxLines?: ExprOr<number>;
    readonly alignment?: ExprOr<string>;
    readonly overflow?: ExprOr<string>;

    constructor({
        text,
        textStyle,
        maxLines,
        alignment,
        overflow,
    }: {
        text?: ExprOr<string>;
        textStyle?: JsonLike | TextStyle;
        maxLines?: ExprOr<number>;
        alignment?: ExprOr<string>;
        overflow?: ExprOr<string>;
    }) {
        this.text = text;
        this.textStyle = textStyle;
        this.maxLines = maxLines;
        this.alignment = alignment;
        this.overflow = overflow;
    }

    static fromJson(json: JsonLike): TextPropsClass {
        return new TextPropsClass({
            text: ExprOr.fromJson<string>(json['text']) ?? undefined,
            textStyle: as$<JsonLike>(json['textStyle']) ?? undefined,
            maxLines: ExprOr.fromJson<number>(json['maxLines']) ?? undefined,
            alignment: ExprOr.fromJson<string>(json['alignment']) ?? undefined,
            overflow: ExprOr.fromJson<string>(json['overflow']) ?? undefined,
        });
    }
}
