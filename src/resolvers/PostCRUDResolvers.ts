import { GraphQLResolveInfo } from "graphql";
import { Args, Ctx, Info, Query, Resolver } from "type-graphql";
import { Post, PostCrudResolver } from "../prisma/generated/type-graphql";
import { FindManyPostArgs } from "../types/args/PostCRUDArgs";
import { GraphQLContext } from "../typings/global";

@Resolver(() => Post)
export class PostCRUDResolvers {
    private static readonly CRUD_RESOLVER = new PostCrudResolver();

    @Query((_returns) => [Post]!, {
        nullable: true
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
}
