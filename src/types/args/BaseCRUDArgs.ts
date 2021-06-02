export abstract class BaseCRUDArgs {
    take!: number;
    skip!: number;
    cursorOnId?: string;
}
