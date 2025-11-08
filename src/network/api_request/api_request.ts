import { HttpMethod, BodyType, JsonLike, BodyTypeHelper } from '../types';

/**
 * Variable definition for API request configuration.
 */
export interface Variable {
    type: string;
    name: string;
    value?: any;
    defaultValue?: any;
}

/**
 * API request model defining the configuration for an API call.
 * Mirrors the structure from the Flutter SDK.
 */
export class APIModel {
    /** Unique identifier for the API model */
    readonly id: string;

    /** Optional name/description for the API */
    readonly name?: string;

    /** The URL endpoint for the API request */
    readonly url: string;

    /** HTTP method for the request */
    readonly method: HttpMethod;

    /** Request headers as a JSON-like object */
    readonly headers?: JsonLike;

    /** Request body as a JSON-like object */
    readonly body?: JsonLike;

    /** Type of the request body */
    readonly bodyType?: BodyType;

    /** Variables that can be used in the request */
    readonly variables?: Record<string, Variable>;

    /**
     * Creates a new APIModel instance.
     * 
     * @param options - API model configuration
     */
    constructor(options: {
        id: string;
        name?: string;
        url: string;
        method: HttpMethod;
        headers?: JsonLike;
        body?: JsonLike;
        bodyType?: BodyType;
        variables?: Record<string, Variable>;
    }) {
        this.id = options.id;
        this.name = options.name;
        this.url = options.url;
        this.method = options.method;
        this.headers = options.headers;
        this.body = options.body;
        this.bodyType = options.bodyType;
        this.variables = options.variables;
    }

    /**
     * Create an APIModel from JSON data.
     * 
     * @param json - The JSON object to parse
     * @returns A new APIModel instance
     * 
     * @example
     * ```typescript
     * const apiModel = APIModel.fromJson({
     *   id: 'getUserById',
     *   url: '/api/users/:id',
     *   method: 'GET',
     *   headers: { 'Authorization': 'Bearer token' }
     * });
     * ```
     */
    static fromJson(json: Record<string, any>): APIModel {
        return new APIModel({
            id: json.id,
            name: json.name,
            url: json.url,
            method: this.parseHttpMethod(json.method),
            headers: json.headers,
            body: json.body,
            bodyType: this.parseBodyType(json.bodyType),
            variables: json.variables,
        });
    }

    /**
     * Convert the APIModel to a JSON object.
     * 
     * @returns A plain JSON object
     */
    toJson(): Record<string, any> {
        return {
            id: this.id,
            name: this.name,
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body,
            bodyType: this.bodyType,
            variables: this.variables,
        };
    }

    /**
     * Parse HTTP method from string or enum.
     * 
     * @param method - The method to parse
     * @returns HttpMethod enum value
     */
    private static parseHttpMethod(method: string | HttpMethod): HttpMethod {
        if (typeof method === 'string') {
            const upperMethod = method.toUpperCase();
            return HttpMethod[upperMethod as keyof typeof HttpMethod] || HttpMethod.GET;
        }
        return method;
    }

    /**
     * Parse body type from string or enum.
     * 
     * @param bodyType - The body type to parse
     * @returns BodyType enum value or undefined
     */
    private static parseBodyType(bodyType?: string | BodyType): BodyType | undefined {
        if (!bodyType) return undefined;

        if (typeof bodyType === 'string') {
            return BodyTypeHelper.fromString(bodyType);
        }
        return bodyType as BodyType;
    }

    /**
     * Create a GET request model.
     * 
     * @param options - Request configuration
     * @returns A new APIModel instance
     */
    static get(options: {
        id: string;
        name?: string;
        url: string;
        headers?: JsonLike;
        variables?: Record<string, Variable>;
    }): APIModel {
        return new APIModel({
            ...options,
            method: HttpMethod.GET,
        });
    }

    /**
     * Create a POST request model.
     * 
     * @param options - Request configuration
     * @returns A new APIModel instance
     */
    static post(options: {
        id: string;
        name?: string;
        url: string;
        headers?: JsonLike;
        body?: JsonLike;
        bodyType?: BodyType;
        variables?: Record<string, Variable>;
    }): APIModel {
        return new APIModel({
            ...options,
            method: HttpMethod.POST,
            bodyType: options.bodyType ?? BodyType.JSON,
        });
    }

    /**
     * Create a PUT request model.
     * 
     * @param options - Request configuration
     * @returns A new APIModel instance
     */
    static put(options: {
        id: string;
        name?: string;
        url: string;
        headers?: JsonLike;
        body?: JsonLike;
        bodyType?: BodyType;
        variables?: Record<string, Variable>;
    }): APIModel {
        return new APIModel({
            ...options,
            method: HttpMethod.PUT,
            bodyType: options.bodyType ?? BodyType.JSON,
        });
    }

    /**
     * Create a DELETE request model.
     * 
     * @param options - Request configuration
     * @returns A new APIModel instance
     */
    static delete(options: {
        id: string;
        name?: string;
        url: string;
        headers?: JsonLike;
        variables?: Record<string, Variable>;
    }): APIModel {
        return new APIModel({
            ...options,
            method: HttpMethod.DELETE,
        });
    }

    /**
     * Create a PATCH request model.
     * 
     * @param options - Request configuration
     * @returns A new APIModel instance
     */
    static patch(options: {
        id: string;
        name?: string;
        url: string;
        headers?: JsonLike;
        body?: JsonLike;
        bodyType?: BodyType;
        variables?: Record<string, Variable>;
    }): APIModel {
        return new APIModel({
            ...options,
            method: HttpMethod.PATCH,
            bodyType: options.bodyType ?? BodyType.JSON,
        });
    }
}
