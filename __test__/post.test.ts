import { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import { Post } from "../src/prisma/generated/type-graphql";
import { getApolloClient } from "./helpers/getApolloClient";
import { seedDatabase, userInfo } from "./helpers/seedDatabase";

const client = getApolloClient();
const prisma = PrismaClient.client;

describe("Test Post model related functionality", () => {
    beforeAll(seedDatabase);

    afterAll(async () => {
        client.stop();
        return prisma.$disconnect();
    });

    test("Should expose published posts", async () => {
        const QUERY_NAME = "posts";

        const {
            data: { posts }
        } = await client.query<{
            // Is there a better way?
            // Maybe...
            // ¯\_(ツ)_/¯
            [QUERY_NAME]: Pick<Post, "id" | "published">[];
        }>({
            query: gql`
                query getPosts {
                    ${QUERY_NAME} {
                        id
                        published
                    }
                }
            `
        });

        expect(Array.isArray(posts)).toBe(true);
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach((post) =>
            expect(post.hasOwnProperty("published")).toBe(true)
        );
        posts.forEach((post) => expect(post.published).toBe(true));

        // This won't work because
        // pagination...

        // const allPublishedPosts = await prisma.post.count({where: {
        //     published: true
        // }});

        // expect(allPublishedPosts).toBe(posts.length);
    });

    test("Should expose own private posts on authentication", async () => {
        const authClient = getApolloClient(userInfo.jwt);
        const QUERY_NAME = "posts";

        const {
            data: { posts }
        } = await authClient.query<{
            [QUERY_NAME]: Partial<Post>[];
        }>({
            query: gql`
                query {
                    ${QUERY_NAME}(own: true) {
                        published
                        author {
                            id
                        }
                    }
                }
            `
        });
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.length).toBeGreaterThan(0);
        expect(typeof userInfo.data?.id).toBe("string");
        posts.forEach((post) =>
            expect(post.author && post.author.id).toBe(userInfo.data!.id)
        );
        // Not necessarily true, but
        // we made the data up so...
        // Also, `!post.published !== post.published === false`.
        expect(posts.some((post) => post.published === false)).toBe(true);
    });
});
