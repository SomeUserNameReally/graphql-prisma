import { PostCreateInput } from "../../prisma/generated/type-graphql";

interface GraphActions {
    create(ownerIdentifier: string, data: unknown): Promise<unknown>;
}

export interface GraphPostActions extends GraphActions {
    create(authorID: string, data: Partial<PostCreateInput>): Promise<unknown>;
}
