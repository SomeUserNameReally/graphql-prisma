import { ArgsType, Field, Int } from "type-graphql";
import { BaseCRUDArgs } from "./BaseCRUDArgs";

@ArgsType()
export class FindManyPostArgs implements BaseCRUDArgs {
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
