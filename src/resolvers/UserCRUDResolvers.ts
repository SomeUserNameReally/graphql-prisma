import { GraphQLResolveInfo } from "graphql";
import { Args, Ctx, Info, Query, Resolver } from "type-graphql";
import { User, UserCrudResolver } from "../prisma/generated/type-graphql";
import { FindManyUserArgs } from "../types/args/UserCRUDArgs";
import { GraphQLContext } from "../typings/global";

@Resolver(() => User)
export class UserCRUDResolvers {
    private static readonly CRUD_RESOLVER = new UserCrudResolver();

    @Query((_returns) => [User]!)
    async users(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindManyUserArgs
    ) {
        return UserCRUDResolvers.CRUD_RESOLVER.users(context, info, {
            where: {
                OR: [
                    {
                        OR: [
                            {
                                firstName: {
                                    contains: args.query
                                }
                            },
                            {
                                lastName: {
                                    contains: args.query
                                }
                            }
                        ]
                    },
                    {
                        email: {
                            contains: args.query
                        }
                    }
                ]
            }
        });
    }
}
