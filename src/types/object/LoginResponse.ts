import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../../prisma/generated/type-graphql";

@ObjectType()
export class LoginResponse {
    @Field((_type) => User, {
        nullable: true
    })
    user?: User;

    @Field((_type) => String)
    token!: string;

    @Field((_type) => Int)
    expiresIn!: number;
}
