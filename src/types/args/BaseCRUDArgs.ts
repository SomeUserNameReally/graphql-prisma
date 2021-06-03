export abstract class BaseCRUDArgs<T> {
    take!: number;
    skip!: number;
    cursorOnId?: string;

    // Rather than making this an array
    // type as Prisma expects, we will
    // leave this as a unitary type so
    // processing to be done on it may
    // be reduced from O(n) to O(1) time
    // in the best case.

    // On the contrary, we will parse this
    // as an array directly before giving
    // it to Prisma.
    orderBy?: T | undefined;
}
