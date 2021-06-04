import "reflect-metadata";
import "class-validator";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
// For finer control, but still unauthenticated.
// you can do
// import resolvers from "./resolversCherryPick";
// Default way of importing all generated resolvers
// import { resolvers } from "./prisma/generated/type-graphql";
import { PrismaClient } from "./prisma/client";
import { resolvers } from "./resolvers";
import PubSubImplementation from "./PubSub";
import { getUserId } from "./helpers/auth/getUserId";
import { GraphQLContext } from "./typings/global";
import { authChecker } from "./helpers/auth/authChecker";

export class Server {
    private static server?: ApolloServer;

    static async init(): Promise<void> {
        if (Server.server) return;

        const pubSub = new PubSubImplementation();
        // ... Building schema here
        const schema = await buildSchema({
            resolvers,
            emitSchemaFile: true,
            pubSub,
            authChecker
        });

        // Create the GraphQL server
        const { client: prisma } = PrismaClient;
        Server.server = new ApolloServer({
            schema,
            playground: true,
            context(expressContext): GraphQLContext {
                return {
                    prisma,
                    resolveUserId(transferNullPayload: boolean = false) {
                        return getUserId(
                            expressContext.connection
                                ? expressContext.connection.context
                                      .Authorization
                                : expressContext.req.headers.authorization,
                            transferNullPayload
                        );
                    }
                };
            }
        });

        // Start the server
        const { url } = await Server.server.listen(
            process.env.NODE_ENV === "test" ? 4000 : 4200
        );

        console.log(
            `Server is running, GraphQL Playground available at ${url} in env ${
                process.env.NODE_ENV || "NULL"
            }`
        );
    }

    static async close() {
        if (!Server.server) return;

        try {
            Server.server.stop();
            Server.server = undefined;
            return true;
        } catch {
            return false;
        }
    }

    static isRunning() {
        return Server.server !== undefined;
    }
}
