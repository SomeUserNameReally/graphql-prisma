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
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import { sign as jwtSign } from "jsonwebtoken";
import ms from "ms";
import {
    CreateUserArgs,
    DeleteUserArgs,
    FindManyUserArgs as _FindManyUserArgs,
    Post,
    UpdateUserArgs,
    User,
    UserCrudResolver
} from "../prisma/generated/type-graphql";
import { FindManyUserArgs } from "../types/args/UserCRUDArgs";
import { GraphQLContext } from "../typings/global";
import { BCRYPT_SALT_ROUNDS, JWT_SIGNING_KEY } from "../config";
import { LoginArgs } from "../types/args/LoginArgs";
import { LoginResponse } from "../types/object/LoginResponse";
import { standardizePaginationParams } from "../helpers/resolvers/standardizePaginationParams";

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
        const { take, skip } = standardizePaginationParams(args);

        const _args: Partial<_FindManyUserArgs> = {
            take,
            skip,
            cursor: args.cursorOnId
                ? {
                      id: args.cursorOnId
                  }
                : undefined
        };

        if (args.query) {
            _args.where = {
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
            };
        }

        return UserCRUDResolvers.CRUD_RESOLVER.users(context, info, {
            ...args,
            ..._args
        });
    }

    @Authorized()
    @Query((_returns) => User)
    async me(@Ctx() context: GraphQLContext, @Info() info: GraphQLResolveInfo) {
        const userIdInfo = await context.resolveUserId();
        return UserCRUDResolvers.CRUD_RESOLVER.user(context, info, {
            where: {
                id: userIdInfo!.id
            }
        });
    }

    @FieldResolver((_returns) => [Post], {
        nullable: "items"
    })
    async posts(@Ctx() context: GraphQLContext, @Root() parent: User) {
        const userIdInfo = await context.resolveUserId(true);

        return await context.prisma.post.findMany({
            where: {
                authorId: {
                    equals: parent.id
                },
                published:
                    userIdInfo && userIdInfo.id === parent.id ? undefined : true
            }
        });
    }

    @FieldResolver((_returns) => String, {
        nullable: true
    })
    async email(
        @Root() parent: User,
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo
    ) {
        const userIdInfo = await context.resolveUserId(true);

        if (userIdInfo && parent.id === userIdInfo.id) {
            const user = await UserCRUDResolvers.CRUD_RESOLVER.user(
                context,
                info,
                {
                    where: {
                        id: userIdInfo.id
                    }
                }
            );

            return user!.email;
        }

        return "";
    }

    @Mutation((_returns) => LoginResponse)
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

        if (BCRYPT_SALT_ROUNDS < 10 || JWT_SIGNING_KEY.length < 10)
            throw new Error("Server Error");

        const password = await bcryptHash(
            args.data.password,
            BCRYPT_SALT_ROUNDS
        );

        const user = await UserCRUDResolvers.CRUD_RESOLVER.createUser(
            context,
            info,
            {
                ...args,
                data: {
                    ...args.data,
                    email: args.data.email.trim().toLowerCase(),
                    password
                }
            }
        );

        const expiresIn = "1d";

        const token = jwtSign({ id: user.id }, JWT_SIGNING_KEY, {
            expiresIn
        });

        return {
            user,
            token,
            expiresIn: ms(expiresIn)
        };
    }

    @Authorized()
    @Mutation((_returns) => User, {
        nullable: true
    })
    async deleteUser(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: DeleteUserArgs
    ) {
        const userIdInfo = await context.resolveUserId();

        const userExists = await context.prisma.user.findUnique({
            where: {
                id: (userIdInfo && userIdInfo.id) || undefined
            }
        });

        if (!userExists) throw new Error("No such user!");

        return UserCRUDResolvers.CRUD_RESOLVER.deleteUser(context, info, {
            ...args,
            where: {
                id: (userIdInfo && userIdInfo.id) || undefined
            }
        });
    }

    @Authorized()
    @Mutation((_returns) => User, {
        nullable: true
    })
    async updateUser(
        @Ctx() context: GraphQLContext,
        @Info() info: GraphQLResolveInfo,
        @Args() args: UpdateUserArgs
    ) {
        const userIdInfo = await context.resolveUserId();

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

        return UserCRUDResolvers.CRUD_RESOLVER.updateUser(context, info, {
            ...args,
            where: {
                id: (userIdInfo && userIdInfo.id) || undefined
            }
        });
    }

    @Mutation((_returns) => LoginResponse)
    async login(@Ctx() context: GraphQLContext, @Args() args: LoginArgs) {
        const user = await context.prisma.user.findUnique({
            where: {
                email: args.email.trim().toLowerCase()
            }
        });

        if (!user) throw new Error("Signin Failed!");

        const match = await bcryptCompare(args.password, user.password);
        if (!match) throw new Error("Signin Failed!");

        const expiresIn = "1d";

        if (JWT_SIGNING_KEY.length < 10) throw new Error("Server Error");

        const token = jwtSign({ id: user.id }, JWT_SIGNING_KEY, {
            expiresIn
        });

        return { token, expiresIn: ms(expiresIn) };
    }
}
