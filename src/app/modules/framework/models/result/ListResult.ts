export interface ListResult<T> {
    entities: T[],
    success: boolean,
    message: string
}