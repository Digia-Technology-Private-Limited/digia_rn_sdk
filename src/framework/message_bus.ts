import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Represents an event that can be dispatched through the message bus.
 */
export class Message {
    /** The name/type of the message */
    readonly name: string;

    /** Optional payload data */
    readonly payload?: any;

    constructor(options: {
        name: string;
        payload?: any;
    }) {
        this.name = options.name;
        this.payload = options.payload;
    }

    toString(): string {
        return `Message(name: ${this.name}, payload: ${JSON.stringify(this.payload)})`;
    }
}

/**
 * Message bus for inter-component communication using a publish-subscribe pattern.
 * 
 * The MessageBus provides a decoupled way for components to communicate without
 * direct references to each other. Components can send messages and subscribe
 * to receive messages by name.
 * 
 * @example
 * ```typescript
 * const messageBus = new MessageBus();
 * 
 * // Subscribe to a specific message
 * const subscription = messageBus.on('user-login').subscribe((message) => {
 *   console.log('User logged in:', message.payload);
 * });
 * 
 * // Send a message
 * messageBus.send(new Message({
 *   name: 'user-login',
 *   payload: { userId: '123', name: 'John' }
 * }));
 * 
 * // Cleanup
 * subscription.unsubscribe();
 * messageBus.dispose();
 * ```
 */
export class MessageBus {
    private readonly _subject: Subject<Message>;

    /**
     * Get the underlying RxJS Subject.
     * Use this for advanced stream operations.
     */
    get streamController(): Subject<Message> {
        return this._subject;
    }

    /**
     * Creates a MessageBus for handling communication within the Digia UI SDK.
     */
    constructor();

    /**
     * Creates a MessageBus with a custom Subject.
     * 
     * This allows for custom message handling implementations if needed.
     * 
     * @param customSubject - Custom RxJS Subject to use
     */
    constructor(customSubject?: Subject<Message>);

    constructor(customSubject?: Subject<Message>) {
        this._subject = customSubject ?? new Subject<Message>();
    }

    /**
     * Listen for messages with the specified name.
     * 
     * Returns an observable that you can subscribe to. The observable emits
     * only messages matching the specified name, or all messages if no name
     * is provided.
     * 
     * IMPORTANT: Remember to unsubscribe when the component unmounts to avoid
     * memory leaks.
     * 
     * @param messageName - Optional message name to filter by
     * @returns Observable stream of matching messages
     * 
     * @example
     * ```typescript
     * // In a React component
     * useEffect(() => {
     *   const subscription = messageBus.on('button_click').subscribe((message) => {
     *     console.log('Button clicked:', message.payload);
     *   });
     *   
     *   // Cleanup subscription on unmount
     *   return () => subscription.unsubscribe();
     * }, []);
     * 
     * // Listen to all messages
     * const allSubscription = messageBus.on().subscribe((message) => {
     *   console.log('Any message:', message.name);
     * });
     * ```
     */
    on(messageName?: string): Subject<Message> {
        if (messageName === undefined) {
            return this._subject;
        }

        // Create a filtered subject for this specific message name
        const filtered = new Subject<Message>();

        const subscription = this._subject
            .pipe(filter(msg => msg.name === messageName))
            .subscribe(msg => filtered.next(msg));

        // Store the subscription so it can be cleaned up
        (filtered as any)._parentSubscription = subscription;

        return filtered;
    }

    /**
     * Send a message through the message bus.
     * 
     * All subscribers listening for this message name will receive it.
     * 
     * @param message - The message to send
     * 
     * @example
     * ```typescript
     * messageBus.send(new Message({
     *   name: 'analytics',
     *   payload: { event: 'button_click', screen: 'home' }
     * }));
     * 
     * messageBus.send(new Message({
     *   name: 'navigation',
     *   payload: { screen: 'Profile' }
     * }));
     * ```
     */
    send(message: Message): void {
        this._subject.next(message);
    }

    /**
     * Close the message bus and clean up resources.
     * 
     * This should only be called when the SDK is being disposed.
     * After calling dispose, the message bus cannot be used anymore.
     */
    dispose(): void {
        this._subject.complete();
    }

    /**
     * Check if the message bus has been disposed.
     */
    get isClosed(): boolean {
        return this._subject.closed;
    }
}

/**
 * Create a typed message bus with predefined message types.
 * 
 * This provides compile-time type safety for message names and payloads.
 * 
 * @example
 * ```typescript
 * type AppMessages = {
 *   'user-login': { userId: string; name: string };
 *   'navigation': { screen: string; params?: any };
 *   'data-loaded': { items: any[] };
 * };
 * 
 * const messageBus = createTypedMessageBus<AppMessages>();
 * 
 * // Type-safe usage
 * messageBus.on('user-login').subscribe((message) => {
 *   console.log(message.payload.userId); // TypeScript knows the payload shape
 * });
 * 
 * messageBus.send('user-login', {
 *   userId: '123',
 *   name: 'John'
 * });
 * ```
 */
export function createTypedMessageBus<TMessages extends Record<string, any>>() {
    const bus = new MessageBus();

    return {
        /**
         * Listen for messages of a specific type.
         */
        on<K extends keyof TMessages>(messageName: K): Subject<Message> {
            return bus.on(messageName as string);
        },

        /**
         * Send a typed message.
         */
        send<K extends keyof TMessages>(
            messageName: K,
            payload: TMessages[K]
        ): void {
            bus.send(new Message({
                name: messageName as string,
                payload,
            }));
        },

        /**
         * Send a message object directly.
         */
        sendMessage(message: Message): void {
            bus.send(message);
        },

        /**
         * Dispose the message bus.
         */
        dispose: () => bus.dispose(),

        /**
         * Check if disposed.
         */
        get isClosed() {
            return bus.isClosed;
        },
    };
}
