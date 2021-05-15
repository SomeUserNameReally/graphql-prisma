import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class FindManyCommentArgs {
    @Field((_type) => String, {
        nullable: true
    })
    query?: string;
}
