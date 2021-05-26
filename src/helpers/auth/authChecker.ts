import { AuthChecker } from "type-graphql";
import { GraphQLContext } from "../../typings/global";
import { verifyUser } from "./verifyUser";

export const authChecker: AuthChecker<GraphQLContext> = async ({ context }) => {
    try {
        await verifyUser(context.resolveUserId, context.prisma);
        return true;
    } catch {
        return false;
    }
};
