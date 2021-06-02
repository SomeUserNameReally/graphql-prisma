import { BaseCRUDArgs } from "../../types/args/BaseCRUDArgs";

export const standardizePaginationParams = <T extends BaseCRUDArgs>({
    take: _take,
    skip: _skip
}: T) => {
    // Default values can be kept in sync with
    // global variables or db data.
    const take = _take >= 0 && _take <= 100 ? _take : 10;
    const skip = _skip >= 0 ? _skip : 0;

    return {
        take,
        skip
    };
};
