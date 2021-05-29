import { GraphQLResolveInfo } from "graphql";
import {
    Args,
    Authorized,
    Ctx,
    FieldResolver,
    Info,
    Mutation,
    PubSub,
    Query,
    Resolver,
    Root
} from "type-graphql";
import {
    CreatePostArgs,
    DeletePostArgs,
    Post,
    PostCrudResolver,
    PostWhereInput,
    UpdatePostArgs,
    User
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
        const published: Pick<PostWhereInput, "published"> = {
            published: {
                equals: true
            }
        };

        return PostCRUDResolvers.CRUD_RESOLVER.posts(
            context,
            info,
            args.query
                ? {
                      where: {
                          AND: [
                              {
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
                              },
                              published
                          ]
                      }
                  }
                : {
                      where: published
                  }
        );
    }

    @Authorized()
    @Mutation((_returns) => Post)
    async createPost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: CreatePostArgs,
        @PubSub() pubsub: PubSubImplementation
    ) {
        const userIdInfo = await context.resolveUserId();

        const post = await PostCRUDResolvers.CRUD_RESOLVER.createPost(
            context,
            info,
            {
                ...args,
                data: {
                    ...args.data,
                    author: {
                        connect: {
                            id: (userIdInfo && userIdInfo.id) || undefined
                        }
                    }
                }
            }
        );

        if (post.published)
            PostCRUDResolvers.publishPostChange(
                post,
                SubscriptionMutationPayload.CREATED,
                pubsub
            );

        return post;
    }

    @Authorized()
    @Mutation((_returns) => Post)
    async deletePost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: DeletePostArgs
    ) {
        const userIdInfo = await context.resolveUserId();

        const post = await context.prisma.post.findFirst({
            where: {
                id: args.where.id,
                authorId: (userIdInfo && userIdInfo.id) || undefined
            }
        });

        if (!post) throw new Error("No such post.");

        return PostCRUDResolvers.CRUD_RESOLVER.deletePost(context, info, {
            ...args,
            where: {
                id: args.where.id
            }
        });
    }

    @Mutation((_returns) => Post)
    async updatePost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: UpdatePostArgs
    ) {
        return PostCRUDResolvers.CRUD_RESOLVER.updatePost(context, info, args);
    }

    @FieldResolver((_returns) => User)
    async author(@Ctx() { prisma }: GraphQLContext, @Root() parent: Post) {
        return prisma.user.findUnique({
            where: {
                id: parent.authorId
            }
        });
    }

    private static async publishPostChange(
        data: Post,
        mutation: SubscriptionMutationPayload,
        pubsubEngine: PubSubImplementation
    ) {
        return pubsubEngine.publish<
            StaticSubscriptionChannelNames.POST,
            PostSubscriptionPayload
        >(StaticSubscriptionChannelNames.POST, {
            data,
            mutation
        });
    }
}
