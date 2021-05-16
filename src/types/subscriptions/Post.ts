import { Field, ObjectType } from "type-graphql";
import { Post } from "../../prisma/generated/type-graphql";
import { SubscriptionMutationPayload } from "../../typings/enums/subscriptions";
import BaseSubscriptionPayload from "./Base";

@ObjectType()
export default class PostSubscriptionPayload
    implements BaseSubscriptionPayload {
    @Field(() => SubscriptionMutationPayload)
    mutation!: SubscriptionMutationPayload;

    @Field(() => Post)
    data!: Post;
}
