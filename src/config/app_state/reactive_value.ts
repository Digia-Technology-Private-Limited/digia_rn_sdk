import { Subject } from 'rxjs';
import { DigiaUIManager } from '../../init/digia_ui_manager';
import { StateType } from '../../dui_config';

/**
 * Generate a random unique identifier.
 * Simple implementation - can be replaced with uuid or similar library.
 */
function randomId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * A reactive value that holds a value and exposes its changes through a stream.
 * 
 * This class wraps a value and provides a broadcast stream for change notifications.
 * It integrates with the state observer for debugging and inspection capabilities.
 * 
 * @template T - The type of the value being stored
 * 
 * @example
 * ```typescript
 * const counter = new ReactiveValue(0, 'counterChangeStream');
 * 
 * // Subscribe to changes
 * counter.controller.subscribe(value => {
 *   console.log('Counter changed:', value);
 * });
 * 
 * // Update the value
 * counter.update(1); // Returns true (value changed)
 * counter.update(1); // Returns false (value unchanged)
 * 
 * // Cleanup
 * counter.dispose();
 * ```
 */
export class ReactiveValue<T = any> {
    /**
     * The current value.
     */
    private _value: T;

    /**
     * Stream key name for this reactive value.
     */
    public readonly streamName: string;

    /**
     * Unique ID for this reactive value instance.
     */
    public readonly stateId: string;

    /**
     * Derived namespace (stream name without 'changeStream' suffix).
     */
    public readonly namespace: string;

    /**
     * Stream controller for value changes (broadcast).
     */
    private readonly _controller: Subject<T>;

    /**
     * Static getter for the state observer from the inspector.
     */
    private static get stateObserver() {
        return DigiaUIManager.getInstance().inspector?.stateObserver;
    }

    /**
     * Create a new ReactiveValue with an initial value and stream name.
     * 
     * @param initialValue - The initial value to store
     * @param streamName - The name of the change stream
     */
    constructor(initialValue: T, streamName: string) {
        this._value = initialValue;
        this.streamName = streamName;
        this.stateId = randomId();
        this.namespace = streamName.replace(/changeStream/g, '');

        // Create a broadcast stream controller (RxJS Subject)
        this._controller = new Subject<T>();

        // Log state creation if inspector is available
        ReactiveValue.stateObserver?.onCreate({
            id: this.stateId,
            stateType: StateType.App,
            namespace: this.namespace,
            stateData: { value: this._value },
        });
    }

    /**
     * Get the stream controller for subscribing to value changes.
     */
    get controller(): Subject<T> {
        return this._controller;
    }

    /**
     * Get the current value.
     */
    get value(): T {
        return this._value;
    }

    /**
     * Update the value and notify listeners.
     * 
     * Only updates if the new value is different from the current value.
     * Uses strict equality (===) for comparison.
     * 
     * @param newValue - The new value to set
     * @returns True if the value was actually changed, false otherwise
     */
    update(newValue: T): boolean {
        if (this._value !== newValue) {
            // Log state change if inspector is available
            ReactiveValue.stateObserver?.onChange({
                id: this.stateId,
                stateType: StateType.App,
                namespace: this.namespace,
                stateData: { value: newValue },
            });

            this._value = newValue;
            this._controller.next(this._value);
            return true;
        }
        return false;
    }

    /**
     * Dispose the reactive value and close the stream controller.
     * 
     * After disposal, the controller will no longer emit values and
     * all subscriptions will be completed.
     */
    dispose(): void {
        // Log state disposal if inspector is available
        ReactiveValue.stateObserver?.onDispose({
            id: this.stateId,
            stateType: StateType.App,
            namespace: this.namespace,
            stateData: { value: this._value },
        });

        this._controller.complete();
    }

    /**
     * Convert to a plain object representation.
     */
    toJSON(): { streamName: string; value: T; stateId: string; namespace: string } {
        return {
            streamName: this.streamName,
            value: this._value,
            stateId: this.stateId,
            namespace: this.namespace,
        };
    }

    /**
     * String representation for debugging.
     */
    toString(): string {
        return `ReactiveValue(${this.namespace}: ${JSON.stringify(this._value)})`;
    }
}
