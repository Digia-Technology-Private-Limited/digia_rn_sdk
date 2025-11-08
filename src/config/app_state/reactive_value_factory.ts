import { JsonLike } from '../../framework/utils/types';
import { StateDescriptor } from './state_descriptor_parser';
import { PersistedReactiveValue } from './persisted_reactive_value';
import { ReactiveValue } from './reactive_value';
import { storage, StorageAdapter } from '../../storage/storage';

/**
 * Abstract factory for creating ReactiveValue instances from StateDescriptors.
 * 
 * Note: For persistence, this uses the storage abstraction layer from '../../storage/storage'.
 * By default, it uses in-memory storage. To enable disk persistence with React Native:
 * 
 * 1. Install AsyncStorage: `npm install @react-native-async-storage/async-storage`
 * 2. Create a storage adapter and set it before creating reactive values:
 * 
 * ```typescript
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { storage, StorageAdapter } from '@digia/rn-sdk';
 * 
 * // Create adapter that wraps AsyncStorage
 * const asyncStorageAdapter: StorageAdapter = {
 *   getString: (key) => {
 *     const value = AsyncStorage.getItem(key);
 *     return value; // Note: AsyncStorage is async, this is simplified
 *   },
 *   setString: (key, value) => {
 *     AsyncStorage.setItem(key, value);
 *   },
 *   // ... implement other methods
 * };
 * 
 * // Set the adapter globally
 * storage.setAdapter(asyncStorageAdapter);
 * ```
 */
export abstract class ReactiveValueFactory {
    /**
     * Create a ReactiveValue instance based on the descriptor configuration.
     * 
     * @param descriptor - State descriptor containing configuration
     * @returns A ReactiveValue or PersistedReactiveValue instance
     */
    abstract create(descriptor: StateDescriptor<any>): ReactiveValue<any>;
}

/**
 * Default implementation of ReactiveValueFactory.
 * 
 * Creates reactive values based on the descriptor type and persistence settings.
 * Supports number, string, boolean, JSON object, and array types.
 * 
 * Persisted values use the global storage instance, which can be configured
 * to use AsyncStorage or other storage backends. See ReactiveValueFactory
 * documentation for setup instructions.
 * 
 * @example
 * ```typescript
 * const factory = new DefaultReactiveValueFactory();
 * 
 * const descriptor = new StateDescriptor({
 *   key: 'counter',
 *   initialValue: 0,
 *   shouldPersist: true,
 *   deserialize: (s) => parseInt(s, 10),
 *   serialize: (v) => v.toString(),
 *   description: 'number',
 *   streamName: 'counterChangeStream'
 * });
 * 
 * const reactiveValue = factory.create(descriptor);
 * // Returns PersistedReactiveValue<number> with initial value 0
 * ```
 */
export class DefaultReactiveValueFactory implements ReactiveValueFactory {
    /**
     * Create a ReactiveValue instance based on the descriptor.
     * 
     * @param descriptor - State descriptor containing configuration
     * @returns A ReactiveValue or PersistedReactiveValue instance
     * @throws Error if the descriptor type is not supported
     */
    create(descriptor: StateDescriptor<any>): ReactiveValue<any> {
        switch (descriptor.description) {
            case 'number':
                return this._createTyped<number>(descriptor);

            case 'string':
                return this._createTyped<string>(descriptor);

            case 'bool':
                return this._createTyped<boolean>(descriptor);

            case 'json':
                return this._createTyped<JsonLike>(descriptor);

            case 'list':
                return this._createTyped<any[]>(descriptor);

            default:
                throw new Error(`Unsupported type for key: ${descriptor.key}, description: ${descriptor.description}`);
        }
    }

    /**
     * Create a typed ReactiveValue instance.
     * 
     * If the descriptor specifies persistence, creates a PersistedReactiveValue.
     * Otherwise, creates a standard ReactiveValue.
     * 
     * @template T - The type of the value
     * @param descriptor - State descriptor
     * @returns A ReactiveValue or PersistedReactiveValue instance
     */
    private _createTyped<T>(descriptor: StateDescriptor<T>): ReactiveValue<T> {
        if (descriptor.shouldPersist) {
            return new PersistedReactiveValue<T>({
                key: descriptor.key,
                initialValue: descriptor.initialValue,
                streamName: descriptor.streamName,
                fromString: descriptor.deserialize,
                toString: descriptor.serialize,
            });
        } else {
            return new ReactiveValue<T>(
                descriptor.initialValue,
                descriptor.streamName
            );
        }
    }
}

/**
 * Create a custom reactive value factory with type mappings.
 * 
 * @example
 * ```typescript
 * const customFactory = createReactiveValueFactory({
 *   customType: (descriptor) => new ReactiveValue(
 *     descriptor.initialValue,
 *     descriptor.streamName
 *   )
 * });
 * ```
 */
export function createReactiveValueFactory(
    typeHandlers?: Record<string, (descriptor: StateDescriptor<any>) => ReactiveValue<any>>
): ReactiveValueFactory {
    return new (class extends DefaultReactiveValueFactory {
        override create(descriptor: StateDescriptor<any>): ReactiveValue<any> {
            // Check custom handlers first
            if (typeHandlers && descriptor.description && typeHandlers[descriptor.description]) {
                return typeHandlers[descriptor.description](descriptor);
            }

            // Fall back to default implementation
            return super.create(descriptor);
        }
    })();
}
