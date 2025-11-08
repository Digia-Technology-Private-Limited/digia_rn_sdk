/**
 * Generic base response wrapper for API responses.
 * Provides a consistent structure for handling API responses throughout the SDK.
 * 
 * @template T - The type of the data payload
 */
export class BaseResponse<T = any> {
    /** Indicates if the API request was successful */
    isSuccess?: boolean;

    /** The response data payload */
    data?: T;

    /** Error information if the request failed */
    error?: Record<string, any>;

    /**
     * Creates a new BaseResponse instance.
     * 
     * @param options - Response configuration
     * @param options.isSuccess - Whether the request was successful
     * @param options.data - The response data
     * @param options.error - Error information
     */
    constructor(options?: {
        isSuccess?: boolean;
        data?: T;
        error?: Record<string, any>;
    }) {
        this.isSuccess = options?.isSuccess;
        this.data = options?.data;
        this.error = options?.error;
    }

    /**
     * Create a BaseResponse from JSON data.
     * 
     * @param json - The JSON object to parse
     * @param fromJsonT - Optional function to transform the data field
     * @returns A new BaseResponse instance
     * 
     * @example
     * ```typescript
     * const response = BaseResponse.fromJson(jsonData);
     * 
     * // With custom data transformer
     * const response = BaseResponse.fromJson(
     *   jsonData,
     *   (data) => new User(data)
     * );
     * ```
     */
    static fromJson<T>(
        json: Record<string, any>,
        fromJsonT?: (json: any) => T
    ): BaseResponse<T> {
        return new BaseResponse<T>({
            isSuccess: json.isSuccess,
            data: fromJsonT && json.data != null ? fromJsonT(json.data) : json.data,
            error: json.error,
        });
    }

    /**
     * Convert the BaseResponse to a JSON object.
     * 
     * @param toJsonT - Optional function to transform the data field
     * @returns A plain JSON object
     * 
     * @example
     * ```typescript
     * const json = response.toJson();
     * 
     * // With custom data transformer
     * const json = response.toJson((user) => user.toJson());
     * ```
     */
    toJson(toJsonT?: (value: T) => any): Record<string, any> {
        return {
            isSuccess: this.isSuccess,
            data: toJsonT && this.data != null ? toJsonT(this.data) : this.data,
            error: this.error,
        };
    }

    /**
     * Convert the BaseResponse to a JSON string.
     * 
     * @param toJsonT - Optional function to transform the data field
     * @returns A JSON string representation
     */
    toString(toJsonT?: (value: T) => any): string {
        return JSON.stringify(this.toJson(toJsonT));
    }

    /**
     * Check if the response indicates success.
     * 
     * @returns True if the response is successful
     */
    get isSuccessful(): boolean {
        return this.isSuccess === true;
    }

    /**
     * Check if the response indicates failure.
     * 
     * @returns True if the response failed
     */
    get isFailed(): boolean {
        return this.isSuccess === false;
    }

    /**
     * Get the error message from the response.
     * 
     * @returns The error message or undefined
     */
    get errorMessage(): string | undefined {
        if (this.error) {
            return this.error.message || this.error.error || JSON.stringify(this.error);
        }
        return undefined;
    }

    /**
     * Create a successful response.
     * 
     * @param data - The response data
     * @returns A new BaseResponse indicating success
     * 
     * @example
     * ```typescript
     * const response = BaseResponse.success({ id: 1, name: 'John' });
     * ```
     */
    static success<T>(data: T): BaseResponse<T> {
        return new BaseResponse<T>({
            isSuccess: true,
            data,
        });
    }

    /**
     * Create a failed response.
     * 
     * @param error - The error information
     * @returns A new BaseResponse indicating failure
     * 
     * @example
     * ```typescript
     * const response = BaseResponse.failure({
     *   message: 'Not found',
     *   code: 404
     * });
     * ```
     */
    static failure<T = any>(error: Record<string, any>): BaseResponse<T> {
        return new BaseResponse<T>({
            isSuccess: false,
            error,
        });
    }
}
