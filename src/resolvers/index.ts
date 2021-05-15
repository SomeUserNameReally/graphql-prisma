import { UserCRUDResolvers } from "./UserCRUDResolvers";
import { PostCRUDResolvers } from "./PostCRUDResolvers";
import { NonEmptyArray } from "type-graphql";

// Explicit typing needed
export const resolvers: NonEmptyArray<Function> = [
    UserCRUDResolvers,
    PostCRUDResolvers
];
