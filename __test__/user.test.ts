import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import fetch from "node-fetch";

const client = new ApolloBoost({ uri: "http://localhost:4000", fetch });

describe("Test User model related functionality", () => {
    beforeAll(async () => {
        await PrismaClient.client.user.deleteMany();
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
