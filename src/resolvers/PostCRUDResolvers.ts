import { GraphQLResolveInfo } from "graphql";
import { Args, Ctx, Info, Mutation, Query, Resolver } from "type-graphql";
import {
    CreatePostArgs,
    Post,
    PostCrudResolver
} from "../prisma/generated/type-graphql";
import { FindManyPostArgs } from "../types/args/PostCRUDArgs";
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
        @Args() args: CreatePostArgs
    ) {
        return PostCRUDResolvers.CRUD_RESOLVER.createPost(context, info, args);
    }
}
