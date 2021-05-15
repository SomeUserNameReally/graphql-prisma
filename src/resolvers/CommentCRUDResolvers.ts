import { GraphQLResolveInfo } from "graphql";
import { Args, Ctx, Info, Query, Resolver } from "type-graphql";
import { Comment, CommentCrudResolver } from "../prisma/generated/type-graphql";
import { FindManyCommentArgs } from "../types/args/CommentCRUDArgs";
import { GraphQLContext } from "../typings/global";

@Resolver(() => Comment)
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
}
