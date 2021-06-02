import { ArgsType, Field, Int } from "type-graphql";
import { BaseArgs } from "./BaseCRUDArgs";

@ArgsType()
export class FindManyUserArgs implements BaseArgs {
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
