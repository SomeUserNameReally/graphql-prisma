import { PubSub } from "apollo-server";
import { PubSubEngine } from "type-graphql";

export default class PubSubImplementation extends PubSubEngine {
    static readonly PUBSUB = new PubSub();

    publish<U extends string, T extends Object>(
        triggerName: U,
        payload: T
    ): Promise<void> {
        return PubSubImplementation.PUBSUB.publish(triggerName, payload);
    }

    subscribe(
        triggerName: string,
        onMessage: (...args: any[]) => void
    ): Promise<number> {
        return PubSubImplementation.PUBSUB.subscribe(triggerName, onMessage);
    }

    unsubscribe(subId: number) {
        return PubSubImplementation.PUBSUB.unsubscribe(subId);
    }

    asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
        return PubSubImplementation.PUBSUB.asyncIterator<T>(triggers);
    }
}
