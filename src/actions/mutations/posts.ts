import { prisma } from "../../prisma/client";
import { PostCreateInput } from "../../prisma/generated/type-graphql";
import { GraphPostActions } from "../../typings/actions";

export class PostActions implements GraphPostActions {
    static readonly POST_ACTIONS = new PostActions();

    constructor() {
        return PostActions.POST_ACTIONS;
    }

    async create(authorID: string, data: Partial<PostCreateInput>) {
        if (data.author)
            console.warn(
                "The author provided as part of the data payload will not be used!"
            );

        const { title, body: postBody } = data;
        if (!title) throw new Error("You must provide a title for a new post!");

        const user = await prisma.user.findUnique({ where: { id: authorID } });
        if (!user) throw new Error("User not found!");

        const body = postBody || "";

        const post = await prisma.post.create({
            data: {
                title,
                body,
                ...data,
                author: {
                    connect: {
                        id: authorID
                    }
                }
            },
            select: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        posts: {
                            select: {
                                id: true,
                                title: true,
                                published: true
                            }
                        }
                    }
                }
            }
        });

        return post.author;
    }
}
