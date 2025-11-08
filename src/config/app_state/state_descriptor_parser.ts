import { to } from '../../framework/utils/object_util';
import { JsonLike } from '../../framework/utils/types';

/**
 * Describes how a state value should behave.
 * 
 * This descriptor contains all the metadata needed to create and manage
 * a reactive state value, including serialization, persistence, and initialization.
 * 
 * @template T - The type of the state value
 */
export class StateDescriptor<T = any> {
    /** Unique key for the state value */
    readonly key: string;

    /** Initial value for the state */
    readonly initialValue: T;

    /** Whether this state should be persisted to storage */
    readonly shouldPersist: boolean;

    /** Function to deserialize from string storage */
    readonly deserialize: (s: string) => T;

    /** Function to serialize to string for storage */
    readonly serialize: (v: T) => string;

    /** Optional description of the state */
    readonly description?: string;

    /** Name of the change stream for this state */
    readonly streamName: string;

    constructor(options: {
        key: string;
        initialValue: T;
        shouldPersist?: boolean;
        deserialize: (s: string) => T;
        serialize: (v: T) => string;
        description?: string;
        streamName: string;
    }) {
        this.key = options.key;
        this.initialValue = options.initialValue;
        this.shouldPersist = options.shouldPersist ?? true;
        this.deserialize = options.deserialize;
        this.serialize = options.serialize;
        this.description = options.description;
        this.streamName = options.streamName;
    }
}

/**
 * Abstract parser for creating StateDescriptors from JSON.
 */
export abstract class StateDescriptorParser<T = any> {
    abstract parse(json: JsonLike): StateDescriptor<T>;
}

/**
 * Parser for numeric state descriptors.
 */
class NumDescriptorParser extends StateDescriptorParser<number> {
    parse(json: JsonLike): StateDescriptor<number> {
        const value = json['value'];
        const initialValue = typeof value === 'number'
            ? value
            : to<number>(value, { type: 'number', defaultValue: 0 }) ?? 0;

        return new StateDescriptor<number>({
            key: json['name'] as string,
            initialValue,
            shouldPersist: to<boolean>(json['shouldPersist'], { type: 'boolean' }) ?? false,
            deserialize: (s) => to<number>(s, { type: 'number', defaultValue: 0 }) ?? 0,
            serialize: (v) => v.toString(),
            description: 'number',
            streamName: json['streamName'] as string,
        });
    }
}

/**
 * Parser for string state descriptors.
 */
class StringDescriptorParser extends StateDescriptorParser<string> {
    parse(json: JsonLike): StateDescriptor<string> {
        const value = json['value'];
        const initialValue = value?.toString() ?? '';

        return new StateDescriptor<string>({
            key: json['name'] as string,
            initialValue,
            shouldPersist: to<boolean>(json['shouldPersist'], { type: 'boolean' }) ?? false,
            deserialize: (s) => s,
            serialize: (v) => v,
            description: 'string',
            streamName: json['streamName'] as string,
        });
    }
}

/**
 * Parser for boolean state descriptors.
 */
class BoolDescriptorParser extends StateDescriptorParser<boolean> {
    parse(json: JsonLike): StateDescriptor<boolean> {
        const value = json['value'];

        function parseBool(val: any): boolean {
            if (typeof val === 'number') return val !== 0;
            return to<boolean>(val, { type: 'boolean', defaultValue: false }) ?? false;
        }

        return new StateDescriptor<boolean>({
            key: json['name'] as string,
            initialValue: parseBool(value),
            shouldPersist: to<boolean>(json['shouldPersist'], { type: 'boolean' }) ?? false,
            deserialize: (s) => to<boolean>(s, { type: 'boolean', defaultValue: false }) ?? false,
            serialize: (v) => v.toString(),
            description: 'bool',
            streamName: json['streamName'] as string,
        });
    }
}

/**
 * Parser for JSON object state descriptors.
 */
class JsonDescriptorParser extends StateDescriptorParser<JsonLike> {
    parse(json: JsonLike): StateDescriptor<JsonLike> {
        function parseJson(val: any): JsonLike {
            return to<JsonLike>(val, { type: 'object', defaultValue: {} }) ?? {};
        }

        return new StateDescriptor<JsonLike>({
            key: json['name'] as string,
            initialValue: parseJson(json['value']),
            shouldPersist: to<boolean>(json['shouldPersist'], { type: 'boolean' }) ?? false,
            deserialize: (s) => parseJson(s),
            serialize: (v) => JSON.stringify(v),
            description: 'json',
            streamName: json['streamName'] as string,
        });
    }
}

/**
 * Parser for JSON array state descriptors.
 */
class JsonArrayDescriptorParser extends StateDescriptorParser<any[]> {
    parse(json: JsonLike): StateDescriptor<any[]> {
        function parseList(val: any): any[] {
            return to<any[]>(val, { type: 'array', defaultValue: [] }) ?? [];
        }

        return new StateDescriptor<any[]>({
            key: json['name'] as string,
            initialValue: parseList(json['value']),
            shouldPersist: to<boolean>(json['shouldPersist'], { type: 'boolean' }) ?? false,
            deserialize: (s) => parseList(s),
            serialize: (v) => JSON.stringify(v),
            description: 'list',
            streamName: json['streamName'] as string,
        });
    }
}

/**
 * Factory for creating StateDescriptors from JSON based on type.
 * 
 * Supports multiple state types with aliases:
 * - number/numeric
 * - string
 * - bool/boolean
 * - json (object)
 * - list/array
 * 
 * @example
 * ```typescript
 * const factory = new StateDescriptorFactory();
 * 
 * const descriptor = factory.fromJson({
 *   type: 'number',
 *   name: 'counter',
 *   value: 0,
 *   shouldPersist: true,
 *   streamName: 'counterChangeStream'
 * });
 * ```
 */
export class StateDescriptorFactory {
    private readonly parsers: Map<string, StateDescriptorParser<any>>;
    private readonly typeAliases: Map<string, string>;

    constructor() {
        this.parsers = new Map<string, StateDescriptorParser<any>>([
            ['number', new NumDescriptorParser()],
            ['string', new StringDescriptorParser()],
            ['bool', new BoolDescriptorParser()],
            ['json', new JsonDescriptorParser()],
            ['list', new JsonArrayDescriptorParser()],
        ]);

        this.typeAliases = new Map([
            ['boolean', 'bool'],
            ['numeric', 'number'],
            ['array', 'list'],
        ]);
    }

    /**
     * Create a StateDescriptor from a JSON object.
     * 
     * @param json - JSON object containing state configuration
     * @returns StateDescriptor for the specified type
     * @throws Error if the type is not supported
     */
    fromJson(json: JsonLike): StateDescriptor<any> {
        const type = json['type'] as string;

        // Try direct type lookup
        let parser = this.parsers.get(type);

        // Try alias lookup if direct lookup failed
        if (!parser) {
            const aliasedType = this.typeAliases.get(type);
            if (aliasedType) {
                parser = this.parsers.get(aliasedType);
            }
        }

        if (!parser) {
            throw new Error(`Unknown state type: ${type}`);
        }

        return parser.parse(json);
    }

    /**
     * Register a custom parser for a type.
     * 
     * @param type - The type name to register
     * @param parser - The parser instance
     */
    registerParser(type: string, parser: StateDescriptorParser<any>): void {
        this.parsers.set(type, parser);
    }

    /**
     * Register a type alias.
     * 
     * @param alias - The alias name
     * @param targetType - The actual type name
     */
    registerAlias(alias: string, targetType: string): void {
        this.typeAliases.set(alias, targetType);
    }

    /**
     * Get all registered type names (including aliases).
     */
    getSupportedTypes(): string[] {
        return [
            ...Array.from(this.parsers.keys()),
            ...Array.from(this.typeAliases.keys()),
        ];
    }
}
