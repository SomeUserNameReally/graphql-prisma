import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export class FindManyUserArgs {
    @Field((_type) => String, {
        nullable: true
    })
    query?: string;

    @Field((_type) => Int, {
        nullable: true
    })
    take: number = 10;

    @Field((_type) => Int, {
        nullable: true
    })
    skip: number = 0;
}
