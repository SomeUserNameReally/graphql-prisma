import { PrismaClient } from "../../prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SIGNING_KEY } from "../../config";

export const getUserId = async (authToken?: string) => {
    if (!authToken || typeof authToken !== "string")
        throw new Error("Please provide a valid auth token");

    if (!JWT_SIGNING_KEY || JWT_SIGNING_KEY.trim().length < 10) {
        // Fail silently
        return;
    }

    const decoded = jwt.verify(authToken.split(" ")[1] || "", JWT_SIGNING_KEY);
    if (typeof decoded === "string") throw new Error("Invalid JWT signature");

    return await PrismaClient.client.user.findUnique({
        where: {
            id: (decoded as any).id + ""
        },
        select: {
            id: true
        }
    });
};
