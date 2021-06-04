import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import fetch from "node-fetch";
import { hashSync as bcryptHashSync } from "bcrypt";

const client = new ApolloBoost({ uri: "http://localhost:4000", fetch });

describe("Test User model related functionality", () => {
    beforeAll(async () => {
        await PrismaClient.client.post.deleteMany();
        await PrismaClient.client.user.deleteMany();

        const user = await PrismaClient.client.user.create({
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

        await PrismaClient.client.post.create({
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

        await PrismaClient.client.post.create({
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
        return PrismaClient.client.$disconnect();
    });

    test("Should create a new user", async () => {
        const { data } = await client.mutate({
            mutation: gql`
                mutation createUser {
                    createUser(
                        data: {
                            email: "user_1@example.com"
                            password: "abc12345"
                            firstName: "User"
                            lastName: "One"
                            age: 30
                        }
                    ) {
                        user {
                            id
                        }
                        token
                    }
                }
            `
        });

        expect(!!data.createUser.token).toBeTruthy();
        expect(typeof data.createUser.token).toBe("string");
        expect(data.createUser.token.length).toBeGreaterThan(0);

        const user = await PrismaClient.client.user.findUnique({
            where: {
                id: data.createUser.user.id
            }
        });

        expect(user).not.toBe(null);
        expect(typeof user).toBe("object");
        expect(Object.keys(user!).length).toBeGreaterThan(0);
    });
});
