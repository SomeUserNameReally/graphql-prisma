import { Prisma, PrismaClient } from "@prisma/client";
import { getUserId } from "../helpers/auth/getUserId";

export interface GraphQLContext {
    prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
    resolveUserId: (
        transferNullPayload?: boolean
    ) => ReturnType<typeof getUserId>;
}
