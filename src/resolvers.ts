import { NonEmptyArray } from "type-graphql";
import { User, UserCrudResolver } from "./prisma/generated/type-graphql";

export default [User, UserCrudResolver] as NonEmptyArray<Function>;
