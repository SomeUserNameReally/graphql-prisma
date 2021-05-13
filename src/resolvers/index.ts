import { UserCRUDResolvers } from "./UserCRUDResolvers";
import { NonEmptyArray } from "type-graphql";

// Explicit typing needed
export const resolvers: NonEmptyArray<Function> = [UserCRUDResolvers];
