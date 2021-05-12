import { PostCreateInput, User } from "../../prisma/generated/type-graphql";
import { GraphQLContext } from "../global";

interface GraphActions {
    create(
        identifier: string,
        data: unknown,
        context: GraphQLContext
    ): Promise<unknown>;
}

export interface GraphPostActions extends GraphActions {
    create(
        id: string,
        data: PostCreateInput,
        context: GraphQLContext
    ): Promise<unknown>;
}
