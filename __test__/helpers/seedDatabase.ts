import { hashSync as bcryptHashSync } from "bcrypt";
import { Maybe } from "graphql/jsutils/Maybe";
import { sign as jwtSign } from "jsonwebtoken";
import { PrismaClient } from "../../src/prisma/client";
import { User, UserCreateInput } from "../../src/prisma/generated/type-graphql";

const prisma = PrismaClient.client;

export const userInfo: {
    input: UserCreateInput;
    data: Maybe<User>;
    jwt: Maybe<string>;
} = {
    input: {
        email: "default@example.com",
        firstName: "Default",
        lastName: "User",
        password: bcryptHashSync(
            "abc1234",
            +(process.env.BCRYPT_SALT_ROUNDS || 10)
        ),
        age: 30
    },
    data: undefined,
    jwt: undefined
};

export const seedDatabase = async () => {
    if (!process.env.JWT_SIGNING_KEY) throw new Error("No signing key found!");

    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    userInfo.data = await prisma.user.create({
        data: userInfo.input
    });

    userInfo.jwt = jwtSign(
        { id: userInfo.data.id },
        process.env.JWT_SIGNING_KEY
    );

    await prisma.post.create({
        data: {
            title: "Post one",
            body: "This is post one.",
            author: {
                connect: {
                    id: userInfo.data.id
                }
            }
        }
    });

    await prisma.post.create({
        data: {
            title: "Post two",
            body: "This is post two.",
            author: {
                connect: {
                    id: userInfo.data.id
                }
            },
            published: false
        }
    });
};
