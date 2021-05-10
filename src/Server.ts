import "reflect-metadata";
import "class-validator";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import { PrismaClient } from "@prisma/client";

export class Server {
    private static server: ApolloServer;

    static async init(): Promise<void> {
        if (Server.server) return;

        const prisma = new PrismaClient();

        // ... Building schema here
        const schema = await buildSchema({
            resolvers,
            emitSchemaFile: true
        });

        // Create the GraphQL server
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
