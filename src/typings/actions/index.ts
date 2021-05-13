import { PostCreateInput } from "../../prisma/generated/type-graphql";

interface GraphActions {
    create(ownerIdentifier: string, data: unknown): unknown;
    update(resourceIdentifier: string, data: unknown): unknown;
}

export interface GraphPostActions extends GraphActions {
    create(authorID: string, data: Partial<PostCreateInput>): Promise<unknown>;
    update(postID: string, data: Partial<PostCreateInput>): Promise<unknown>;
}
