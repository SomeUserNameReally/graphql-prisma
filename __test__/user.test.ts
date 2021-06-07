import { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import { User } from "../src/prisma/generated/type-graphql";
import { LoginArgs } from "../src/types/args/LoginArgs";
import { getApolloClient } from "./helpers/getApolloClient";
import { seedDatabase, userInfo } from "./helpers/seedDatabase";

const client = getApolloClient();
const prisma = PrismaClient.client;

const LOGIN_MUTATION_QUERY_NAME = "login";

const loginMutation = gql`
    mutation($email: String!, $password: String!) {
        ${LOGIN_MUTATION_QUERY_NAME} (email: $email, password: $password) {
            token
            expiresIn
        }
    }
`;

describe("Test User model related functionality", () => {
    beforeAll(seedDatabase);

    afterAll(async () => {
        client.stop();
        return prisma.$disconnect();
    });

    test("Should create a new user", async () => {
        const MUTATION_NAME = "createUser";
        const USER_FIELD_NAME = "user";
        const TOKEN_FIELD_NAME = "token";

        // TODO: Add `hasOwnProperty` calls.

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

        const {
            data: { users }
        } = await client.query<{
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

        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) =>
            expect(user.hasOwnProperty("email")).toBe(true)
        );
        users.forEach((user) => {
            expect(user.email).toBe("");
        });
    });

    test("Should throw on logging in with bad credentials", async () => {
        const variables = {
            email: "NULL_EMAIL",
            password: "NULL_PASSWORD"
        };
        await expect(
            client.mutate<any, LoginArgs>({
                mutation: loginMutation,
                variables
            })
        ).rejects.toThrow();
    });

    // TODO: Add test for createUser mutation throwing on a short password.

    test("Should fetch user profile on authentication", async () => {
        const authClient = getApolloClient(userInfo.jwt);
        const QUERY_NAME = "me";

        const { data } = userInfo;

        const {
            data: { me }
        } = await authClient.query<{
            [QUERY_NAME]: Partial<User>;
        }>({
            query: gql`
                query {
                    ${QUERY_NAME} {
                        id
                        firstName
                        email
                    }
                }
            `
        });
        expect(Object.keys(data || {}).length).toBeGreaterThan(0);
        expect(data!.hasOwnProperty("id")).toBe(true);
        expect(data!.hasOwnProperty("firstName")).toBe(true);
        expect(data!.hasOwnProperty("email")).toBe(true);

        expect(me.id).toBe(data!.id);
        expect(me.firstName).toBe(data!.firstName);
        expect(me.email).toBe(data!.email);
    });
});
