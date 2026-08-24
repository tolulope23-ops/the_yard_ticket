import { PaginatedResponse } from "../interface/pagination-response.interface";

export function createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};