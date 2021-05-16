import { NonEmptyArray, registerEnumType } from "type-graphql";
import { UserCRUDResolvers } from "./UserCRUDResolvers";
import { PostCRUDResolvers } from "./PostCRUDResolvers";
import { CommentCRUDResolvers } from "./CommentCRUDResolvers";
import { SubscriptionMutationPayload } from "../typings/enums/subscriptions";
import { Subscriptions } from "./Subscriptions";

registerEnumType(SubscriptionMutationPayload, {
    name: "SubscriptionMutationPayload",
    description: "Possible subscription mutation states."
});

// Explicit typing needed
export const resolvers: NonEmptyArray<Function> = [
    UserCRUDResolvers,
    PostCRUDResolvers,
    CommentCRUDResolvers,
    Subscriptions
];
