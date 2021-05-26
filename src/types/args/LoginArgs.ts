import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class LoginArgs {
    @Field((_type) => String)
    email!: string;

    @Field((_type) => String)
    password!: string;
}
