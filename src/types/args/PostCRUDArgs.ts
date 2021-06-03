import { ArgsType, Field, Int } from "type-graphql";
import { PostOrderByInput } from "../../prisma/generated/type-graphql";
import { BaseCRUDArgs } from "./BaseCRUDArgs";

@ArgsType()
export class FindManyPostArgs<T extends PostOrderByInput = PostOrderByInput>
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

    @Field((_type) => PostOrderByInput, {
        nullable: true
    })
    orderBy?: T | undefined;
}
