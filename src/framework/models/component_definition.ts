import { Variable } from '../data_type/variable';
import { VariableJsonConverter } from '../data_type/variable_json_convertor';
import { JsonLike } from '../utils';
import { as$ } from '../utils/functional_utils';
import { tryKeys } from '../utils/json_util';
import { VWData } from './vw_data';

export class DUIComponentDefinition {
    readonly id: string;
    readonly argDefs?: Record<string, Variable>;
    readonly initStateDefs?: Record<string, Variable>;
    readonly layout?: { root?: VWData };

    constructor({
        id,
        argDefs,
        initStateDefs,
        layout,
    }: {
        id: string;
        argDefs?: Record<string, Variable>;
        initStateDefs?: Record<string, Variable>;
        layout?: { root?: VWData };
    }) {
        this.id = id;
        this.argDefs = argDefs;
        this.initStateDefs = initStateDefs;
        this.layout = layout;
    }

    static fromJson(json: JsonLike): DUIComponentDefinition {
        return new DUIComponentDefinition({
            id: tryKeys<string>(json, ['uid', 'pageUid', 'pageId']) ?? '',
            argDefs: tryKeys<Record<string, Variable>>(
                json,
                ['argDefs'],
                {
                    parse: (p0: any) => {
                        const jsonLike = as$<JsonLike>(p0);
                        return jsonLike ? new VariableJsonConverter().fromJson(jsonLike) : null;
                    }
                }
            ) ?? undefined,
            initStateDefs: tryKeys<Record<string, Variable>>(
                json,
                ['initStateDefs'],
                {
                    parse: (p0: any) => {
                        const jsonLike = as$<JsonLike>(p0);
                        return jsonLike ? new VariableJsonConverter().fromJson(jsonLike) : null;
                    }
                }
            ) ?? undefined,
            layout: (() => {
                const layoutRoot = as$<JsonLike>(json['layout']?.['root']);
                if (layoutRoot) {
                    const vwData = VWData.fromJson(layoutRoot);
                    return vwData ? { root: vwData } : undefined;
                }
                return undefined;
            })(),
        });
    }
}