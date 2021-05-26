import { Prisma, PrismaClient } from "@prisma/client";

export interface GraphQLContext {
    prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
    resolveUserId: () => Promise<{ id: string } | null | undefined>;
}
