import { SubscriptionMutationPayload } from "../../typings/enums/subscriptions";

export default abstract class BaseSubscriptionPayload {
    abstract mutation: SubscriptionMutationPayload;
}
