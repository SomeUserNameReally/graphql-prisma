import { hashSync as bcryptHashSync } from "bcrypt";
import { PrismaClient } from "../../src/prisma/client";

const prisma = PrismaClient.client;

export const seedDatabase = async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            email: "default@example.com",
            firstName: "Default",
            lastName: "User",
            password: bcryptHashSync(
                "abc1234",
                +(process.env.BCRYPT_SALT_ROUNDS || 10)
            ),
            age: 30
        }
    });

    await prisma.post.create({
        data: {
            title: "Post one",
            body: "This is post one.",
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    await prisma.post.create({
        data: {
            title: "Post two",
            body: "This is post two.",
            author: {
                connect: {
                    id: user.id
                }
            },
            published: false
        }
    });
};
