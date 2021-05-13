import { GraphQLResolveInfo } from "graphql";
import { Args, Ctx, Info, Query, Resolver } from "type-graphql";
import {
    FindUniqueUserArgs,
    User,
    UserCrudResolver
} from "../prisma/generated/type-graphql";
import { GraphQLContext } from "../typings/global";

@Resolver(() => User)
export class UserCRUDResolvers {
    private static readonly CRUD_RESOLVER = new UserCrudResolver();

    @Query((_returns) => User, {
        nullable: true
    })
    async user(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindUniqueUserArgs
    ) {
        return UserCRUDResolvers.CRUD_RESOLVER.user(context, info, args);
    }
}
