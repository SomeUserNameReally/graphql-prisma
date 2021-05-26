import { GraphQLContext } from "../../typings/global";

// Context may contain other properties
// in the future. It's better to explicitly
// ask for what we need.
export const verifyUser = async (
    authIdExtractor: GraphQLContext["resolveUserId"],
    prismaClient: GraphQLContext["prisma"]
) => {
    const idInfo = await authIdExtractor();

    if (!idInfo) throw new Error("Not signed in");

    const user = await prismaClient.user.findUnique({
        where: {
            id: idInfo.id
        }
    });

    if (!user) throw new Error("Not signed in");

    return user;
};
