import "reflect-metadata";
import "class-validator";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
// For finer control, you can do
// import resolvers from "./resolvers";
import { resolvers } from "./prisma/generated/type-graphql";
import { PrismaClient } from "./prisma/client";

export class Server {
    private static server: ApolloServer;

    static async init(): Promise<void> {
        if (Server.server) return;

        // ... Building schema here
        const schema = await buildSchema({
            resolvers,
            emitSchemaFile: true
        });

        // Create the GraphQL server
        const { client: prisma } = PrismaClient;
        Server.server = new ApolloServer({
            schema,
            playground: true,
            context: {
                prisma
            }
        });

        // Start the server
        const { url } = await Server.server.listen(4200);

        console.log(
            `Server is running, GraphQL Playground available at ${url}`
        );
    }
}
