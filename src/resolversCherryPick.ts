// This file is for demonstration purposes only
// and as such is not completely written.

import { NonEmptyArray } from "type-graphql";
import {
    UserCrudResolver,
    PostCrudResolver,
    CommentCrudResolver,
    UserRelationsResolver,
    PostRelationsResolver,
    CommentRelationsResolver
} from "./prisma/generated/type-graphql";

export default [
    UserCrudResolver,
    PostCrudResolver,
    CommentCrudResolver,
    UserRelationsResolver,
    PostRelationsResolver,
    CommentRelationsResolver
] as NonEmptyArray<Function>;
