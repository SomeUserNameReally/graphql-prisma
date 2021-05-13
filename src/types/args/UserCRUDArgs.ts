import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class FindManyUserArgs {
    @Field((_type) => String, {
        nullable: true
    })
    query?: string;
}
