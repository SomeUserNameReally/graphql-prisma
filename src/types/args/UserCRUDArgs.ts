import { ArgsType, Field, Int } from "type-graphql";
import { UserOrderByInput } from "../../prisma/generated/type-graphql";
import { BaseCRUDArgs } from "./BaseCRUDArgs";

@ArgsType()
export class FindManyUserArgs<T extends UserOrderByInput = UserOrderByInput>
    implements BaseCRUDArgs<T> {
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

    @Field((_type) => String, {
        nullable: true
    })
    cursorOnId?: string;

    @Field((_type) => UserOrderByInput, {
        nullable: true
    })
    orderBy?: T | undefined;
}
