import { as$, JsonLike } from "../../framework";


export class FlexFitProps {
    readonly flexFitType?: string | null;
    readonly flexValue?: number | null;

    constructor({
        flexFitType,
        flexValue,
    }: {
        flexFitType?: string | null;
        flexValue?: number | null;
    }) {
        this.flexFitType = flexFitType;
        this.flexValue = flexValue;
    }

    static fromJson(json: JsonLike | null): FlexFitProps {
        return new FlexFitProps({
            flexFitType: as$<string | null>(json?.['flexFitType']),
            flexValue: as$<number | null>(json?.['flexValue']),
        });
    }
}