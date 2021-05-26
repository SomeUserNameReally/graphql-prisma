import { GraphQLResolveInfo } from "graphql";
import {
    Args,
    Ctx,
    FieldResolver,
    Info,
    Mutation,
    Query,
    Resolver,
    Root
} from "type-graphql";
import bcrypt from "bcrypt";
import { sign as jwtSign } from "jsonwebtoken";
import {
    CreateUserArgs,
    DeleteUserArgs,
    Post,
    UpdateUserArgs,
    User,
    UserCrudResolver
} from "../prisma/generated/type-graphql";
import { FindManyUserArgs } from "../types/args/UserCRUDArgs";
import { GraphQLContext } from "../typings/global";
import { BCRYPT_HASH, JWT_SIGNING_KEY } from "../config";

@Resolver((_of) => User)
export class UserCRUDResolvers {
    private static readonly CRUD_RESOLVER = new UserCrudResolver();

    @Query((_returns) => [User], {
        nullable: "items"
    })
    async users(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: FindManyUserArgs
    ) {
        return UserCRUDResolvers.CRUD_RESOLVER.users(
            context,
            info,
            args.query
                ? {
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
                  }
                : {}
        );
    }

    @FieldResolver((_returns) => [Post], {
        nullable: "items"
    })
    async posts(@Ctx() context: GraphQLContext, @Root() parent: User) {
        return await context.prisma.post.findMany({
            where: {
                authorId: parent.id
            }
        });
    }

    @Mutation((_returns) => User)
    async createUser(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: CreateUserArgs
    ) {
        const emailTaken = await context.prisma.user.findUnique({
            where: {
                email: args.data.email
            }
        });

        if (emailTaken) throw new Error("Email taken!");
        if (args.data.password.trim().length < 8)
            throw new Error("Bad password");

        if (!BCRYPT_HASH.length || !JWT_SIGNING_KEY.length)
            throw new Error("Server Error");

        const password = await bcrypt.hash(args.data.password, BCRYPT_HASH);

        const user = await UserCRUDResolvers.CRUD_RESOLVER.createUser(
            context,
            info,
            {
                ...args,
                data: {
                    ...args.data,
                    password
                }
            }
        );

        return {
            user,
            token: jwtSign({ id: user.id }, JWT_SIGNING_KEY)
        };
    }

    @Mutation((_returns) => User, {
        nullable: true
    })
    async deleteUser(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: DeleteUserArgs
    ) {
        if (!args.where.id) throw new Error("Please provide a valid user ID!");

        const emailExists = await context.prisma.user.findUnique({
            where: {
                id: args.where.id
            }
        });

        if (!emailExists) throw new Error("No such user!");

        return UserCRUDResolvers.CRUD_RESOLVER.deleteUser(context, info, args);
    }

    @Mutation((_returns) => User, {
        nullable: true
    })
    async updateUser(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: UpdateUserArgs
    ) {
        const emailExists = await context.prisma.user.findUnique({
            where: args.where.id
                ? {
                      id: args.where.id
                  }
                : {
                      email: args.where.email
                  }
        });

        if (!emailExists) throw new Error("No such user!");

        return UserCRUDResolvers.CRUD_RESOLVER.updateUser(context, info, args);
    }
}
