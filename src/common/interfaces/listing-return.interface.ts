export interface ListingReturn<T>{
    data: T[],
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }
}