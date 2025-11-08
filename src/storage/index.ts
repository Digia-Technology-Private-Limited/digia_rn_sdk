/**
 * Storage abstraction for persisting key-value pairs.
 * 
 * Provides a simple, synchronous storage API that can be backed by
 * different storage implementations (in-memory, AsyncStorage, custom).
 */

export { storage, type StorageAdapter } from './storage';
