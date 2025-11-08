import { as } from "../utils/functional_utils";
export class VWRepeatData {
    readonly type: string;
    readonly datum: any;

    get isJson(): boolean {
        return this.type === 'json';
    }

    constructor({ type, datum }: { type: string; datum: any }) {
        this.type = type;
        this.datum = datum;
    }

    static fromJson(json: any): VWRepeatData | null {
        if (json == null) return null;

        if (typeof json === 'string') {
            return new VWRepeatData({ type: 'json', datum: json });
        }

        if (typeof json === 'object' && json !== null) {
            if (json.expr != null) {
                return new VWRepeatData({ type: 'object_path', datum: json.expr });
            }

            // Fallback for legacy format
            if (json.kind != null && json.datum != null) {
                return new VWRepeatData({
                    type: as<string>(json.kind),
                    datum: json.datum,
                });
            }
        }

        return null;
    }
}
