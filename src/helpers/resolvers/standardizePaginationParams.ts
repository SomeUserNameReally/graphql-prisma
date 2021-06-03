import { BaseCRUDArgs } from "../../types/args/BaseCRUDArgs";
import { GenericObject } from "../../typings/utils";

interface StandardizePaginationParams<T> {
    take: number;
    skip: number;
    orderBy?: [T] | undefined;
}

// TODO: I'm sure there's a TypeGraphQL/Prisma way of
// omitting certain fields.

// It may not apply to every scenario though...
export const standardizePaginationParams = <
    U extends GenericObject = GenericObject & {
        password?: "asc" | "desc" | undefined;
    },
    T extends BaseCRUDArgs<U> = BaseCRUDArgs<U>
>({
    take: _take,
    skip: _skip,
    orderBy: _orderBy
}: T): StandardizePaginationParams<U> => {
    // Default values can be kept in sync with
    // global variables or db data.
    const take = _take >= 0 && _take <= 100 ? _take : 10;
    const skip = _skip >= 0 ? _skip : 0;
    const pagination: StandardizePaginationParams<U> = { take, skip };

    if (_orderBy) {
        delete _orderBy.password;
        if (Object.keys(_orderBy).length !== 0) pagination.orderBy = [_orderBy];
    }

    return pagination;
};
