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
import { standardizePaginationParams } from "../helpers/resolvers/standardizePaginationParams";
import {
    CreatePostArgs,
    DeletePostArgs,
    FindUniquePostArgs,
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
        const { take, skip } = standardizePaginationParams(args);
        const userIdInfo = await context.resolveUserId(true);

        const globalORConstraints: PostWhereInput["OR"] = [
            {
                published: {
                    equals: true
                }
            }
        ];

        if (userIdInfo) {
            globalORConstraints.push({
                authorId: {
                    equals: userIdInfo.id
                }
            });
        }

        const base: Partial<FindManyPostArgs> = {
            take,
            skip
        };

        return PostCRUDResolvers.CRUD_RESOLVER.posts(context, info, {
            ...base,
            where: args.query
                ? {
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
                          {
                              OR: globalORConstraints
                          }
                      ]
                  }
                : {
                      OR: globalORConstraints
                  }
        });
    }

    @Query((_returns) => Post, {
        nullable: true
    })
    async post(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindUniquePostArgs
    ) {
        const userIdInfo = await context.resolveUserId(true);

        const globalORConstraints: PostWhereInput["OR"] = [
            {
                published: {
                    equals: true
                }
            }
        ];

        if (userIdInfo) {
            globalORConstraints.push({
                authorId: {
                    equals: userIdInfo.id
                }
            });
        }

        const post = await PostCRUDResolvers.CRUD_RESOLVER.post(
            context,
            info,
            args
        );

        if (
            !post ||
            (!post.published && post.authorId !== (userIdInfo && userIdInfo.id))
        )
            return null;

        return post;
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
        if (!userIdInfo || !userIdInfo.id) throw new Error("User not found!");
        // Presumably we'd make our own input or args type and
        // mark post id as a required parameter.
        // All the same, this works too.
        if (!args.where.id) throw new Error("No post id given!");

        const post = await context.prisma.post.findFirst({
            where: {
                id: args.where.id,
                authorId: userIdInfo.id
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

    @Authorized()
    @Mutation((_returns) => Post)
    async updatePost(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: UpdatePostArgs
    ) {
        const userIdInfo = await context.resolveUserId();

        // Alternate method of circumventing question
        // mark operator bug.
        const user = await context.prisma.user.findUnique({
            where: {
                id: userIdInfo!.id
            }
        });

        if (!user) throw new Error("No such post.");

        return PostCRUDResolvers.CRUD_RESOLVER.updatePost(context, info, {
            ...args,
            data: {
                ...args.data,
                author: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });
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
