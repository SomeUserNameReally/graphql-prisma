import { GraphQLResolveInfo } from "graphql";
import {
    Args,
    Authorized,
    Ctx,
    FieldResolver,
    Info,
    Mutation,
    Query,
    Resolver,
    Root
} from "type-graphql";
import {
    Comment,
    CommentCrudResolver,
    CreateCommentArgs,
    Post,
    User
} from "../prisma/generated/type-graphql";
import { FindManyCommentArgs } from "../types/args/CommentCRUDArgs";
import { GraphQLContext } from "../typings/global";

@Resolver((_of) => Comment)
export class CommentCRUDResolvers {
    private static readonly CRUD_RESOLVER = new CommentCrudResolver();

    @Query((_returns) => [Comment], {
        nullable: "items"
    })
    async comments(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindManyCommentArgs
    ) {
        return CommentCRUDResolvers.CRUD_RESOLVER.comments(
            context,
            info,
            args.query
                ? {
                      where: {
                          text: {
                              contains: args.query
                          }
                      }
                  }
                : {}
        );
    }

    @Authorized()
    @Mutation((_returns) => Comment)
    async createComment(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: CreateCommentArgs
    ) {
        const userIdInfo = await context.resolveUserId();

        const user = await context.prisma.user.findUnique({
            where: {
                id: userIdInfo!.id
            }
        });

        if (!user) throw new Error("No such user!");

        return CommentCRUDResolvers.CRUD_RESOLVER.createComment(context, info, {
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

    // TODO: Intentionally left resolvers pending for
    // updating and deleting comments.

    @FieldResolver((_returns) => Post)
    async post(@Ctx() context: GraphQLContext, @Root() parent: Comment) {
        return await context.prisma.post.findUnique({
            where: {
                id: parent.postId
            }
        });
    }

    @FieldResolver((_returns) => User)
    async author(@Ctx() context: GraphQLContext, @Root() parent: Comment) {
        return await context.prisma.user.findUnique({
            where: {
                id: parent.userId
            }
        });
    }
}
