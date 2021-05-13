import { PrismaClient as _PrismaClient, Prisma } from "@prisma/client";
import { PrismaDelete, onDeleteArgs } from "@paljs/plugins";

export class PrismaClient extends _PrismaClient {
    private static readonly PRISMA_CLIENT = new PrismaClient();

    private constructor(options?: Prisma.PrismaClientOptions) {
        super(options);
    }

    async onDelete(args: onDeleteArgs) {
        const prismaDelete = new PrismaDelete(this);
        await prismaDelete.onDelete(args);
    }

    static get client() {
        return this.PRISMA_CLIENT;
    }
}
