import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import fetch from "node-fetch";
import { hashSync as bcryptHashSync } from "bcrypt";
import { User } from "../src/prisma/generated/type-graphql";

const client = new ApolloBoost({ uri: "http://localhost:4000", fetch });
const prisma = PrismaClient.client;

describe("Test User model related functionality", () => {
    beforeAll(async () => {
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();

        const user = await prisma.user.create({
            data: {
                email: "default@example.com",
                firstName: "Default",
                lastName: "User",
                password: bcryptHashSync(
                    "abc1234",
                    +(process.env.BCRYPT_SALT_ROUNDS || 10)
                ),
                age: 30
            }
        });

        await prisma.post.create({
            data: {
                title: "Post one",
                body: "This is post one.",
                author: {
                    connect: {
                        id: user.id
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
                        id: user.id
                    }
                },
                published: false
            }
        });
    });

    afterAll(async () => {
        client.stop();
        return prisma.$disconnect();
    });

    test("Should create a new user", async () => {
        const MUTATION_NAME = "createUser";
        const USER_FIELD_NAME = "user";
        const TOKEN_FIELD_NAME = "token";

        const { data } = await client.mutate<{
            [MUTATION_NAME]: {
                [USER_FIELD_NAME]: Pick<User, "id">;
                [TOKEN_FIELD_NAME]: string;
            };
        }>({
            mutation: gql`
                mutation createUser {
                    ${MUTATION_NAME}(
                        data: {
                            email: "user_1@example.com"
                            password: "abc12345"
                            firstName: "User"
                            lastName: "One"
                            age: 30
                        }
                    ) {
                        ${USER_FIELD_NAME} {
                            id
                        }
                        ${TOKEN_FIELD_NAME}
                    }
                }
            `
        });

        expect(data).toBeTruthy();
        const { createUser } = data!;

        expect(!!createUser.token).toBeTruthy();
        expect(typeof createUser.token).toBe("string");
        expect(createUser.token.length).toBeGreaterThan(0);

        const user = await prisma.user.findUnique({
            where: {
                id: createUser.user.id
            }
        });

        expect(user).not.toBe(null);
        expect(typeof user).toBe("object");
        expect(Object.keys(user!).length).toBeGreaterThan(0);
    });

    test("Should expose public user profiles", async () => {
        const QUERY_NAME = "users";

        const { data } = await client.query<{
            [QUERY_NAME]: Partial<User>[];
        }>({
            query: gql`
                query getUsers {
                    ${QUERY_NAME} {
                        id
                        firstName
                        lastName
                        email
                    }
                }
            `
        });
        const { users } = data;

        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
            expect(user.email).toBe("");
        });
    });
});