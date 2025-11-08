import { as$ } from '../utils/functional_utils';
import { tryKeys } from '../utils/json_util';
import { JsonLike } from '../utils/types';
import { Variable } from '../data_type/variable';
import { VariableJsonConverter } from '../data_type/variable_json_convertor';
import { ExprOr } from './types';
import { CommonProps } from './common_props';
import { VWRepeatData } from './vw_repeat_data';
import { Props } from './props';

/**
 * Node type enum for virtual widget data.
 */
export enum NodeType {
    Widget = 'widget',
    State = 'state',
    Component = 'component',
}

export namespace NodeType {
    export function fromString(value: string): NodeType | undefined {
        switch (value) {
            case 'widget':
                return NodeType.Widget;
            case 'state':
                return NodeType.State;
            case 'component':
                return NodeType.Component;
            default:
                return undefined;
        }
    }
}

/**
 * Base class for virtual widget data.
 * Sealed class pattern using TypeScript.
 */
export abstract class VWData {
    readonly refName?: string;

    protected constructor(options: { refName?: string }) {
        this.refName = options.refName;
    }

    static fromJson(json: JsonLike): VWData | null {
        const nodeType = tryKeys<string>(json, ['category', 'nodeType']);

        switch (nodeType) {
            case 'widget':
                return VWNodeData.fromJson(json);

            case 'component':
                return VWComponentData.fromJson(json);

            case 'state':
                return VWStateData.fromJson(json);

            default:
                return VWNodeData.fromJson(json);
        }
    }
}

/**
 * Component data for virtual widgets.
 */
export class VWComponentData extends VWData {
    readonly id: string;
    readonly args?: Map<string, ExprOr<any> | null>;
    readonly commonProps?: CommonProps;
    readonly parentProps: Props;

    constructor(options: {
        id: string;
        args?: Map<string, ExprOr<any> | null>;
        refName?: string;
        commonProps?: CommonProps;
        parentProps: Props;
    }) {
        super({ refName: options.refName });
        this.id = options.id;
        this.args = options.args;
        this.commonProps = options.commonProps;
        this.parentProps = options.parentProps;
    }

    static fromJson(json: JsonLike): VWComponentData {
        const argsJson = as$<JsonLike>(json['componentArgs']);
        const argsMap = argsJson
            ? new Map(
                Object.entries(argsJson).map(([k, v]) => [
                    k,
                    ExprOr.fromJson<any>(v),
                ])
            )
            : undefined;

        return new VWComponentData({
            id: json['componentId'] as string,
            args: argsMap,
            refName: tryKeys<string>(json, ['varName', 'refName']) ?? undefined,
            commonProps: as$<JsonLike>(json['containerProps'])
                ? CommonProps.fromJson(as$<JsonLike>(json['containerProps'])!)
                : undefined,
            parentProps:
                as$<JsonLike>(json['parentProps'])
                    ? new Props(as$<JsonLike>(json['parentProps'])!)
                    : Props.empty(),
        });
    }
}

/**
 * State data for virtual widgets.
 */
export class VWStateData extends VWData {
    readonly initStateDefs: Record<string, Variable>;
    readonly childGroups?: Map<string, VWData[]>;
    readonly parentProps: Props;

    constructor(options: {
        refName?: string;
        initStateDefs: Record<string, Variable>;
        childGroups?: Map<string, VWData[]>;
        parentProps: Props;
    }) {
        super({ refName: options.refName });
        this.initStateDefs = options.initStateDefs;
        this.childGroups = options.childGroups;
        this.parentProps = options.parentProps;
    }

    static fromJson(json: JsonLike): VWStateData {
        const initStateDefsJson = as$<JsonLike>(json['initStateDefs']);
        const initStateDefs = initStateDefsJson
            ? new VariableJsonConverter().fromJson(initStateDefsJson)
            : {};

        return new VWStateData({
            initStateDefs,
            childGroups: tryKeys(
                json,
                ['children', 'composites', 'childGroups'],
                { parse: _parseVWNodeDataMap }
            ) ?? undefined,
            refName: tryKeys<string>(json, ['varName', 'refName']) ?? undefined,
            parentProps:
                as$<JsonLike>(json['parentProps'])
                    ? new Props(as$<JsonLike>(json['parentProps'])!)
                    : Props.empty(),
        });
    }
}

/**
 * Node data for virtual widgets.
 */
export class VWNodeData extends VWData {
    readonly type: string;
    readonly props: Props;
    readonly commonProps?: CommonProps;
    readonly parentProps: Props;
    readonly childGroups?: Map<string, VWData[]>;
    readonly repeatData?: VWRepeatData;

    constructor(options: {
        type: string;
        props: Props;
        commonProps?: CommonProps;
        parentProps: Props;
        childGroups?: Map<string, VWData[]>;
        repeatData?: VWRepeatData;
        refName?: string;
    }) {
        super({ refName: options.refName });
        this.type = options.type;
        this.props = options.props;
        this.commonProps = options.commonProps;
        this.parentProps = options.parentProps;
        this.childGroups = options.childGroups;
        this.repeatData = options.repeatData;
    }

    static fromJson(json: JsonLike): VWNodeData {
        // Try to parse repeatData from multiple locations
        let repeatData: VWRepeatData | undefined;

        // First try dataRef or repeatData keys
        repeatData = tryKeys(
            json,
            ['dataRef', 'repeatData'],
            { parse: VWRepeatData.fromJson }
        ) ?? undefined;

        // Fallback: check props.dataSource
        if (!repeatData && json['props'] && typeof json['props'] === 'object') {
            const propsJson = as$<JsonLike>(json['props']);
            if (propsJson?.['dataSource']) {
                repeatData = VWRepeatData.fromJson(propsJson['dataSource']) ?? undefined;
            }
        }

        return new VWNodeData({
            type: as$<string>(json['type']) ?? '',
            props:
                as$<JsonLike>(json['props'])
                    ? new Props(as$<JsonLike>(json['props'])!)
                    : Props.empty(),
            commonProps: as$<JsonLike>(json['containerProps'])
                ? CommonProps.fromJson(as$<JsonLike>(json['containerProps'])!)
                : undefined,
            parentProps:
                as$<JsonLike>(json['parentProps'])
                    ? new Props(as$<JsonLike>(json['parentProps'])!)
                    : Props.empty(),
            childGroups: tryKeys(
                json,
                ['children', 'composites', 'childGroups'],
                { parse: _parseVWNodeDataMap }
            ) ?? undefined,
            repeatData,
            refName: tryKeys<string>(json, ['varName', 'refName']) ?? undefined,
        });
    }

    toJson(): JsonLike {
        return {};
    }
}

/**
 * Parse a JSON object into a map of VWData arrays.
 */
function _parseVWNodeDataMap(json: any): Map<string, VWData[]> | null {
    const jsonMap = as$<JsonLike>(json);
    if (jsonMap == null) return null;

    const entries = Object.entries(jsonMap).map(([key, value]) => {
        const valueArray = as$<any[]>(value);
        const nodeDataList =
            valueArray
                ?.map((item) => as$<JsonLike>(item))
                .filter((item): item is JsonLike => item != null)
                .map((item) => VWData.fromJson(item))
                .filter((item): item is VWData => item != null) ?? [];

        return [key, nodeDataList] as [string, VWData[]];
    });

    return new Map(entries);
}
