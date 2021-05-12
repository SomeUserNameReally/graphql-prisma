import { Ctx } from "type-graphql";
import { PostCreateInput, User } from "../../prisma/generated/type-graphql";
import { GraphPostActions } from "../../typings/actions";
import { GraphQLContext } from "../../typings/global";

export class PostActions implements GraphPostActions {
    static POST_ACTIONS: PostActions;

    constructor() {
        if (!PostActions.POST_ACTIONS)
            PostActions.POST_ACTIONS = new PostActions();

        return PostActions.POST_ACTIONS;
    }

    async create(
        id: string,
        data: PostCreateInput,
        @Ctx() context: GraphQLContext
    ) {
        const { prisma } = context;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error("User not found!");

        const post = await prisma.post.create({
            data,
            select: {
                author: {
                    select: {
                        id: true,
                        firstName: true
                    }
                }
            }
        });

        return post.author;
    }
}
