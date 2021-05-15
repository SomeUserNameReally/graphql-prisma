import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class FindManyPostArgs {
    @Field((_type) => String, {
        nullable: true
    })
    query?: string;
}
