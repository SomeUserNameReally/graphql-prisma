import ApolloBoost, { gql } from "apollo-boost";
import { PrismaClient } from "../src/prisma/client";
import fetch from "node-fetch";
import { Post } from "../src/prisma/generated/type-graphql";
import { seedDatabase } from "./helpers/seedDatabase";

const client = new ApolloBoost({ uri: "http://localhost:4000", fetch });
const prisma = PrismaClient.client;

describe("Test User model related functionality", () => {
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
            [QUERY_NAME]: (Pick<Post, "id" | "published"> & object)[];
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
});
