/**
 * HTTP methods supported by the API client.
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

/**
 * Body types for HTTP requests with associated content types.
 */
export enum BodyType {
    JSON = 'JSON',
    MULTIPART = 'MULTIPART',
    FORM_URLENCODED = 'FORM_URLENCODED',
    GRAPHQL = 'GRAPHQL',
}

/**
 * Helper functions for HttpMethod enum.
 */
export namespace HttpMethodHelper {
    /**
     * Get the string value of an HttpMethod.
     * 
     * @param method - The HTTP method
     * @returns The string representation
     */
    export function getStringValue(method: HttpMethod): string {
        return method;
    }

    /**
     * Parse a string to HttpMethod.
     * 
     * @param value - The string value
     * @returns The HttpMethod enum value
     * @throws Error if the value is not a valid HTTP method
     */
    export function fromString(value: string): HttpMethod {
        const upperValue = value.toUpperCase();
        if (Object.values(HttpMethod).includes(upperValue as HttpMethod)) {
            return upperValue as HttpMethod;
        }
        throw new Error(`Invalid HTTP method: ${value}`);
    }

    /**
     * Check if a string is a valid HTTP method.
     * 
     * @param value - The string to check
     * @returns True if valid
     */
    export function isValid(value: string): boolean {
        return Object.values(HttpMethod).includes(value.toUpperCase() as HttpMethod);
    }
}

/**
 * Helper functions for BodyType enum.
 */
export namespace BodyTypeHelper {
    /**
     * Get the Content-Type header value for a BodyType.
     * 
     * @param bodyType - The body type
     * @returns The Content-Type header value
     */
    export function getContentTypeHeader(bodyType: BodyType): string {
        switch (bodyType) {
            case BodyType.JSON:
                return 'application/json';
            case BodyType.MULTIPART:
                return 'multipart/form-data';
            case BodyType.FORM_URLENCODED:
                return 'application/x-www-form-urlencoded';
            case BodyType.GRAPHQL:
                return 'application/json';
        }
    }

    /**
     * Parse a string to BodyType.
     * 
     * @param value - The string value
     * @returns The BodyType enum value or undefined
     */
    export function fromString(value: string): BodyType | undefined {
        const upperValue = value.toUpperCase();
        if (Object.values(BodyType).includes(upperValue as BodyType)) {
            return upperValue as BodyType;
        }
        return undefined;
    }

    /**
     * Check if a string is a valid BodyType.
     * 
     * @param value - The string to check
     * @returns True if valid
     */
    export function isValid(value: string): boolean {
        return Object.values(BodyType).includes(value.toUpperCase() as BodyType);
    }
}

/**
 * Generic JSON-like object type.
 * Can be a primitive value, object, or array.
 */
export type JsonLike =
    | string
    | number
    | boolean
    | null
    | { [key: string]: JsonLike }
    | JsonLike[];
