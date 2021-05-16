import { GraphQLResolveInfo } from "graphql";
import {
    Args,
    Ctx,
    Info,
    Mutation,
    PubSub,
    Query,
    Resolver
} from "type-graphql";
import {
    CreatePostArgs,
    DeletePostArgs,
    Post,
    PostCrudResolver,
    UpdatePostArgs
} from "../prisma/generated/type-graphql";
import PubSubImplementation from "../PubSub";
import { FindManyPostArgs } from "../types/args/PostCRUDArgs";
import PostSubscriptionPayload from "../types/subscriptions/Post";
import {
    StaticSubscriptionChannelNames,
    SubscriptionMutationPayload
} from "../typings/enums/subscriptions";
import { GraphQLContext } from "../typings/global";

@Resolver((_of) => Post)
export class PostCRUDResolvers {
    private static readonly CRUD_RESOLVER = new PostCrudResolver();

    @Query((_returns) => [Post], {
        nullable: "items"
    })
    async posts(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindManyPostArgs
    ) {
        return PostCRUDResolvers.CRUD_RESOLVER.posts(
            context,
            info,
            args.query
                ? {
                      where: {
                          OR: [
                              {
                                  title: {
                                      contains: args.query
                                  }
                              },
                              {
                                  body: {
                                      contains: args.query
                                  }
                              }
                          ]
                      }
                  }
                : {}
        );
    }

    @Mutation((_returns) => Post)
    async createPost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: CreatePostArgs,
        @PubSub() pubsub: PubSubImplementation
    ) {
        const post = await PostCRUDResolvers.CRUD_RESOLVER.createPost(
            context,
            info,
            args
        );

        if (post.published) {
            pubsub.publish<
                StaticSubscriptionChannelNames.POST,
                PostSubscriptionPayload
            >(StaticSubscriptionChannelNames.POST, {
                data: post,
                mutation: SubscriptionMutationPayload.CREATED
            });
        }

        return post;
    }

    @Mutation((_returns) => Post)
    async deletePost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: DeletePostArgs
    ) {
        return PostCRUDResolvers.CRUD_RESOLVER.deletePost(context, info, args);
    }

    @Mutation((_returns) => Post)
    async updatePost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: UpdatePostArgs
    ) {
        return PostCRUDResolvers.CRUD_RESOLVER.updatePost(context, info, args);
    }
}
