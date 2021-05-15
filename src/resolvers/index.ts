import { NonEmptyArray } from "type-graphql";
import { UserCRUDResolvers } from "./UserCRUDResolvers";
import { PostCRUDResolvers } from "./PostCRUDResolvers";
import { CommentCRUDResolvers } from "./CommentCRUDResolvers";

// Explicit typing needed
export const resolvers: NonEmptyArray<Function> = [
    UserCRUDResolvers,
    PostCRUDResolvers,
    CommentCRUDResolvers
];
