import { PrismaClient } from "../../prisma/client";
import { PostCreateInput } from "../../prisma/generated/type-graphql";
import { GraphPostActions } from "../../typings/actions";

export class PostActions implements GraphPostActions {
    private static readonly POST_ACTIONS = new PostActions();

    constructor() {
        return PostActions.POST_ACTIONS;
    }

    async create(authorID: string, data: Partial<PostCreateInput>) {
        await PostActions._verifyCreateArgs(authorID, data);

        return PostActions._create(authorID, data);
    }

    async update(postID: string, data: Partial<PostCreateInput>) {
        await PostActions._verifyUpdateArgs(postID, data);

        return PostActions._update(postID, data);
    }

    private static async _verifyCreateArgs(
        authorID: string,
        data: Partial<PostCreateInput>
    ) {
        if (data.author)
            console.warn(
                "The author provided as part of the data payload will not be used!"
            );

        const { title } = data;
        if (!title) throw new Error("You must provide a title for a new post!");

        const { client: prisma } = PrismaClient;
        const user = await prisma.user.findUnique({
            where: { id: authorID }
        });
        if (!user) throw new Error("User not found!");
    }

    private static async _create(
        authorID: string,
        data: Partial<PostCreateInput>
    ) {
        const { client: prisma } = PrismaClient;
        const body = data.body?.trim() || "";

        const post = await prisma.post.create({
            data: {
                title: data.title!,
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

    private static async _verifyUpdateArgs(
        postID: string,
        data: Partial<PostCreateInput>
    ) {
        const { title } = data;
        if (title !== undefined && title.trim().length === 0)
            throw new Error("Cannot provide an empty title string!");

        const { client: prisma } = PrismaClient;
        const post = await prisma.post.findUnique({
            where: { id: postID }
        });
        if (!post) throw new Error("No such post!");
    }

    private static async _update(
        postID: string,
        data: Partial<PostCreateInput>
    ) {
        const { client: prisma } = PrismaClient;

        const updatedPost = await prisma.post.update({
            where: {
                id: postID
            },
            data,
            select: {
                author: {
                    select: {
                        id: true,
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

        return updatedPost.author;
    }
}
